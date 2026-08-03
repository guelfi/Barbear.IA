using System.Text.Json;
using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Entities;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Evolution;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/appointments")]
[Authorize]
public sealed class AppointmentsController(AppDbContext db, IMessageOutboxService outbox) : ControllerBase
{
    public sealed record CreateAppointmentRequest(
        Guid BarberId,
        Guid ClientId,
        Guid ServiceId,
        DateTimeOffset StartsAt,
        string? Notes = null);

    public sealed record CancelRequest(string? Reason);

    public sealed record RescheduleRequest(DateTimeOffset StartsAt);

    /// <summary>Clientes: janela mínima de 24h para cancelar/alterar (independente do settings do tenant).</summary>
    private const int ClientChangeHours = 24;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] string? status,
        CancellationToken cancellationToken = default)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var query = db.Appointments.AsNoTracking().Where(a => a.TenantId == tenantId && a.IsActive);

        if (User.HasClaim("permission", Permissions.ViewAppointments))
        {
            // admin: full tenant
        }
        else if (User.HasClaim("permission", Permissions.ViewOwnAppointments))
        {
            var barberId = User.GetBarberId();
            var clientId = User.GetClientId();
            if (barberId.HasValue)
            {
                query = query.Where(a => a.BarberId == barberId);
            }
            else if (clientId.HasValue)
            {
                query = query.Where(a => a.ClientId == clientId);
            }
            else
            {
                return Forbid();
            }
        }
        else
        {
            return Forbid();
        }

        if (from.HasValue)
        {
            query = query.Where(a => a.StartsAt >= from);
        }

        if (to.HasValue)
        {
            query = query.Where(a => a.StartsAt <= to);
        }

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<AppointmentStatus>(status, true, out var parsed))
        {
            query = query.Where(a => a.Status == parsed);
        }

        var rows = await query.OrderBy(a => a.StartsAt).ToListAsync(cancellationToken);
        var serviceIds = rows.Select(a => a.ServiceId).Distinct().ToList();
        var barberIds = rows.Select(a => a.BarberId).Distinct().ToList();
        var clientIds = rows.Select(a => a.ClientId).Distinct().ToList();

        var services = await db.Services.AsNoTracking()
            .Where(s => serviceIds.Contains(s.Id))
            .ToDictionaryAsync(s => s.Id, cancellationToken);
        var barbers = await db.BarberProfiles.AsNoTracking()
            .Where(b => barberIds.Contains(b.Id))
            .ToDictionaryAsync(b => b.Id, cancellationToken);
        var clients = await db.ClientProfiles.AsNoTracking()
            .Where(c => clientIds.Contains(c.Id))
            .ToDictionaryAsync(c => c.Id, cancellationToken);

        var items = rows.Select(a =>
        {
            services.TryGetValue(a.ServiceId, out var service);
            barbers.TryGetValue(a.BarberId, out var barber);
            clients.TryGetValue(a.ClientId, out var client);
            return new
            {
                a.Id,
                a.TenantId,
                a.BarberId,
                a.ClientId,
                a.ServiceId,
                a.StartsAt,
                a.EndsAt,
                status = a.Status.ToString().ToLowerInvariant(),
                a.Notes,
                a.CancellationReason,
                duration = service?.DurationMinutes ?? (int)(a.EndsAt - a.StartsAt).TotalMinutes,
                price = service?.Price ?? 0m,
                a.CreatedAt,
                a.UpdatedAt,
                barber = barber is null ? null : new { barber.Id, barber.Name, barber.Email, barber.Phone },
                client = client is null ? null : new { client.Id, client.Name, client.Email, client.Phone },
                service = service is null ? null : new { service.Id, service.Name, service.Price, service.DurationMinutes, service.Category }
            };
        });

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var a = await db.Appointments.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenantId && x.IsActive, cancellationToken);
        if (a is null)
        {
            return NotFound();
        }

        if (!User.HasClaim("permission", Permissions.ViewAppointments))
        {
            var barberId = User.GetBarberId();
            var clientId = User.GetClientId();
            if (barberId != a.BarberId && clientId != a.ClientId)
            {
                return NotFound();
            }
        }

        var service = await db.Services.AsNoTracking().FirstOrDefaultAsync(s => s.Id == a.ServiceId, cancellationToken);
        var barber = await db.BarberProfiles.AsNoTracking().FirstOrDefaultAsync(b => b.Id == a.BarberId, cancellationToken);
        var client = await db.ClientProfiles.AsNoTracking().FirstOrDefaultAsync(c => c.Id == a.ClientId, cancellationToken);

        return Ok(new
        {
            a.Id,
            a.TenantId,
            a.BarberId,
            a.ClientId,
            a.ServiceId,
            a.StartsAt,
            a.EndsAt,
            status = a.Status.ToString().ToLowerInvariant(),
            a.Notes,
            a.CancellationReason,
            duration = service?.DurationMinutes ?? (int)(a.EndsAt - a.StartsAt).TotalMinutes,
            price = service?.Price ?? 0m,
            a.CreatedAt,
            a.UpdatedAt,
            barber = barber is null ? null : new { barber.Id, barber.Name, barber.Email, barber.Phone },
            client = client is null ? null : new { client.Id, client.Name, client.Email, client.Phone },
            service = service is null ? null : new { service.Id, service.Name, service.Price, service.DurationMinutes, service.Category }
        });
    }

    [HttpGet("today")]
    public Task<IActionResult> Today(CancellationToken cancellationToken)
    {
        var start = DateTimeOffset.UtcNow.Date;
        return List(start, start.AddDays(1), null, cancellationToken);
    }

    [HttpGet("upcoming")]
    public Task<IActionResult> Upcoming([FromQuery] int days = 7, CancellationToken cancellationToken = default)
    {
        days = Math.Clamp(days, 1, 60);
        var from = DateTimeOffset.UtcNow;
        return List(from, from.AddDays(days), null, cancellationToken);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var canManage = User.HasClaim("permission", Permissions.ManageAppointments);
        var canCreate = User.HasClaim("permission", Permissions.CreateAppointments);
        if (!canManage && !canCreate)
        {
            return Forbid();
        }

        if (canCreate && !canManage)
        {
            var clientId = User.GetClientId();
            if (clientId is null || clientId != request.ClientId)
            {
                return Forbid();
            }
        }

        var tenant = await db.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        var settings = ParseSettings(tenant.SettingsJson);
        if (request.StartsAt > DateTimeOffset.UtcNow.AddDays(settings.AdvanceBookingDays))
        {
            return BadRequest(new { error = $"Agendamento permitido apenas até {settings.AdvanceBookingDays} dias." });
        }

        if (request.StartsAt < DateTimeOffset.UtcNow)
        {
            return BadRequest(new { error = "Horário deve ser no futuro." });
        }

        var service = await db.Services.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId && s.TenantId == tenantId && s.IsActive, cancellationToken);
        if (service is null)
        {
            return BadRequest(new { error = "Serviço inválido." });
        }

        var barberExists = await db.BarberProfiles.AsNoTracking()
            .AnyAsync(b => b.Id == request.BarberId && b.TenantId == tenantId && b.IsActive, cancellationToken);
        var client = await db.ClientProfiles.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.TenantId == tenantId && c.IsActive, cancellationToken);
        if (!barberExists || client is null)
        {
            return BadRequest(new { error = "Barbeiro ou cliente inválido." });
        }

        var endsAt = request.StartsAt.AddMinutes(service.DurationMinutes);
        var conflict = await db.Appointments.AsNoTracking().AnyAsync(a =>
            a.TenantId == tenantId &&
            a.BarberId == request.BarberId &&
            a.IsActive &&
            a.Status != AppointmentStatus.Cancelled &&
            a.Status != AppointmentStatus.NoShow &&
            a.StartsAt < endsAt &&
            a.EndsAt > request.StartsAt, cancellationToken);

        if (conflict)
        {
            return Conflict(new { error = "Conflito de horário para o barbeiro." });
        }

        try
        {
            var appointment = Appointment.Schedule(
                tenantId.Value,
                request.BarberId,
                request.ClientId,
                request.ServiceId,
                request.StartsAt,
                endsAt,
                request.Notes);
            db.Appointments.Add(appointment);

            if (User.GetUserId() is Guid actorId)
            {
                db.Notifications.Add(Notification.Create(
                    tenantId.Value,
                    actorId,
                    "appointment",
                    "Agendamento criado",
                    $"Horário {request.StartsAt:dd/MM HH:mm} confirmado na agenda."));
            }

            await db.SaveChangesAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(client.Phone))
            {
                await outbox.EnqueueWhatsAppAsync(
                    client.Phone,
                    $"Barbear.IA: agendamento em {request.StartsAt:dd/MM/yyyy HH:mm}.",
                    cancellationToken);
            }

            return CreatedAtAction(nameof(List), new { id = appointment.Id }, new { appointment.Id });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelRequest? request, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId, cancellationToken);
        if (appointment is null)
        {
            return NotFound();
        }

        var canManage = User.HasClaim("permission", Permissions.ManageAppointments)
                        || User.HasClaim("permission", Permissions.ManageOwnAppointments);
        var canCancelOwn = User.HasClaim("permission", Permissions.CancelOwnAppointments);
        if (!canManage && !canCancelOwn)
        {
            return Forbid();
        }

        if (canCancelOwn && !User.HasClaim("permission", Permissions.ManageAppointments))
        {
            var clientId = User.GetClientId();
            var barberId = User.GetBarberId();
            if (clientId != appointment.ClientId && barberId != appointment.BarberId)
            {
                return NotFound();
            }
        }

        var hoursRequired = ResolveChangeWindowHours();
        if (appointment.StartsAt < DateTimeOffset.UtcNow.AddHours(hoursRequired))
        {
            return BadRequest(new
            {
                error = $"Cancelamento permitido apenas até {hoursRequired}h antes do horário marcado."
            });
        }

        try
        {
            appointment.Cancel(request?.Reason);
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new { appointment.Id, status = "cancelled" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:guid}/reschedule")]
    public async Task<IActionResult> Reschedule(
        Guid id,
        [FromBody] RescheduleRequest request,
        CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId, cancellationToken);
        if (appointment is null)
        {
            return NotFound();
        }

        var canManage = User.HasClaim("permission", Permissions.ManageAppointments);
        var canOwn = User.HasClaim("permission", Permissions.CancelOwnAppointments)
                     || User.HasClaim("permission", Permissions.CreateAppointments);
        if (!canManage && !canOwn)
        {
            return Forbid();
        }

        if (!canManage)
        {
            var clientId = User.GetClientId();
            if (clientId is null || clientId != appointment.ClientId)
            {
                return NotFound();
            }
        }

        var hoursRequired = ResolveChangeWindowHours();
        if (appointment.StartsAt < DateTimeOffset.UtcNow.AddHours(hoursRequired))
        {
            return BadRequest(new
            {
                error = $"Alteração permitida apenas até {hoursRequired}h antes do horário marcado."
            });
        }

        if (request.StartsAt < DateTimeOffset.UtcNow)
        {
            return BadRequest(new { error = "Novo horário deve ser no futuro." });
        }

        var service = await db.Services.AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == appointment.ServiceId && s.TenantId == tenantId, cancellationToken);
        if (service is null)
        {
            return BadRequest(new { error = "Serviço inválido." });
        }

        var endsAt = request.StartsAt.AddMinutes(service.DurationMinutes);
        var conflict = await db.Appointments.AsNoTracking().AnyAsync(a =>
            a.TenantId == tenantId &&
            a.BarberId == appointment.BarberId &&
            a.Id != appointment.Id &&
            a.IsActive &&
            a.Status != AppointmentStatus.Cancelled &&
            a.StartsAt < endsAt &&
            a.EndsAt > request.StartsAt, cancellationToken);
        if (conflict)
        {
            return BadRequest(new { error = "Horário indisponível para este barbeiro." });
        }

        try
        {
            appointment.Reschedule(request.StartsAt, endsAt);
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new { appointment.Id, startsAt = appointment.StartsAt, endsAt = appointment.EndsAt });
        }
        catch (Exception ex) when (ex is ArgumentException or InvalidOperationException)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private int ResolveChangeWindowHours()
    {
        // Clientes (sem manage_appointments): sempre 24h.
        if (!User.HasClaim("permission", Permissions.ManageAppointments))
        {
            return ClientChangeHours;
        }

        return 0; // Admin/gestão pode cancelar/alterar sem janela.
    }

    private static (int AdvanceBookingDays, int CancellationHours) ParseSettings(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(json) ? "{}" : json);
            var root = doc.RootElement;
            var advance = root.TryGetProperty("advanceBookingDays", out var a) && a.TryGetInt32(out var av) ? av : 30;
            var cancel = root.TryGetProperty("cancellationHours", out var c) && c.TryGetInt32(out var cv) ? cv : 24;
            return (advance, cancel);
        }
        catch
        {
            return (30, 24);
        }
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        var barberId = User.GetBarberId();
        if (tenantId is null)
        {
            return Forbid();
        }

        if (!User.HasClaim("permission", Permissions.ManageOwnAppointments) &&
            !User.HasClaim("permission", Permissions.ManageAppointments))
        {
            return Forbid();
        }

        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == id && a.TenantId == tenantId, cancellationToken);
        if (appointment is null)
        {
            return NotFound();
        }

        if (!User.HasClaim("permission", Permissions.ManageAppointments) &&
            barberId != appointment.BarberId)
        {
            return NotFound();
        }

        try
        {
            if (appointment.Status == AppointmentStatus.Scheduled)
            {
                appointment.Confirm();
            }

            if (appointment.Status == AppointmentStatus.Confirmed)
            {
                appointment.Start();
            }

            appointment.Complete();
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new { appointment.Id, status = "completed" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
