using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/dashboard")]
[Authorize]
public sealed class DashboardController(AppDbContext db) : ControllerBase
{
    [Authorize(Policy = Permissions.ViewBarbershopStats)]
    [HttpGet("stats")]
    public async Task<IActionResult> TenantStats(CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var today = DateTimeOffset.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var appointmentsToday = await db.Appointments.CountAsync(a =>
            a.TenantId == tenantId &&
            a.IsActive &&
            a.StartsAt >= today &&
            a.StartsAt < tomorrow &&
            a.Status != AppointmentStatus.Cancelled, cancellationToken);

        var clients = await db.ClientProfiles.CountAsync(c => c.TenantId == tenantId && c.IsActive, cancellationToken);
        var barbers = await db.BarberProfiles.CountAsync(b => b.TenantId == tenantId && b.IsActive, cancellationToken);
        var services = await db.Services.CountAsync(s => s.TenantId == tenantId && s.IsActive, cancellationToken);

        return Ok(new
        {
            appointmentsToday,
            clients,
            barbers,
            services
        });
    }

    [Authorize(Policy = Permissions.ViewGlobalStats)]
    [HttpGet("global")]
    public async Task<IActionResult> GlobalStats(CancellationToken cancellationToken)
    {
        var tenants = await db.Tenants.CountAsync(t => t.IsActive, cancellationToken);
        var pending = await db.Tenants.CountAsync(t => t.Status == TenantStatus.Pending, cancellationToken);
        var approved = await db.Tenants.CountAsync(t => t.Status == TenantStatus.Approved, cancellationToken);
        var users = await db.Users.CountAsync(u => u.IsActive, cancellationToken);

        return Ok(new
        {
            tenants,
            pending,
            approved,
            users
        });
    }

    [Authorize(Policy = Permissions.ViewOwnStats)]
    [HttpGet("barber")]
    public async Task<IActionResult> BarberStats(CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        var barberId = User.GetBarberId();
        if (tenantId is null || barberId is null)
        {
            return Forbid();
        }

        var today = DateTimeOffset.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var todayCount = await db.Appointments.CountAsync(a =>
            a.TenantId == tenantId &&
            a.BarberId == barberId &&
            a.IsActive &&
            a.StartsAt >= today &&
            a.StartsAt < tomorrow &&
            a.Status != AppointmentStatus.Cancelled, cancellationToken);

        var upcoming = await db.Appointments.CountAsync(a =>
            a.TenantId == tenantId &&
            a.BarberId == barberId &&
            a.IsActive &&
            a.StartsAt >= DateTimeOffset.UtcNow &&
            a.Status != AppointmentStatus.Cancelled &&
            a.Status != AppointmentStatus.Completed, cancellationToken);

        return Ok(new { appointmentsToday = todayCount, upcoming });
    }

    [Authorize(Policy = Permissions.ViewBarbershopStats)]
    [HttpGet("realtime")]
    public async Task<IActionResult> Realtime(CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null && !User.IsSuperAdmin())
        {
            return Forbid();
        }

        var now = DateTimeOffset.UtcNow;
        var query = db.Appointments.AsNoTracking().Where(a => a.IsActive && a.Status != AppointmentStatus.Cancelled);
        if (tenantId.HasValue)
        {
            query = query.Where(a => a.TenantId == tenantId);
        }

        var inProgress = await query.CountAsync(a => a.Status == AppointmentStatus.InProgress, cancellationToken);
        var nextHour = await query.CountAsync(a => a.StartsAt >= now && a.StartsAt <= now.AddHours(1), cancellationToken);
        return Ok(new { inProgress, nextHour, serverTime = now });
    }

    [HttpGet("monthly")]
    public async Task<IActionResult> Monthly([FromQuery] int? year, [FromQuery] int? month, CancellationToken cancellationToken)
    {
        if (!User.HasClaim("permission", Permissions.ViewBarbershopStats) &&
            !User.HasClaim("permission", Permissions.ViewGlobalStats))
        {
            return Forbid();
        }

        var y = year ?? DateTimeOffset.UtcNow.Year;
        var m = month ?? DateTimeOffset.UtcNow.Month;
        var start = new DateTimeOffset(y, m, 1, 0, 0, 0, TimeSpan.Zero);
        var end = start.AddMonths(1);
        var tenantId = User.GetTenantId();

        var query = db.Appointments.AsNoTracking().Where(a =>
            a.IsActive &&
            a.StartsAt >= start &&
            a.StartsAt < end &&
            a.Status != AppointmentStatus.Cancelled);

        if (!User.IsSuperAdmin())
        {
            if (tenantId is null)
            {
                return Forbid();
            }

            query = query.Where(a => a.TenantId == tenantId);
        }

        var total = await query.CountAsync(cancellationToken);
        var completed = await query.CountAsync(a => a.Status == AppointmentStatus.Completed, cancellationToken);
        var noShow = await query.CountAsync(a => a.Status == AppointmentStatus.NoShow, cancellationToken);

        return Ok(new { year = y, month = m, total, completed, noShow });
    }
}
