using System.Text.Json;
using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/tenants")]
public sealed class TenantsController(AppDbContext db) : ControllerBase
{
    [Authorize(Policy = Permissions.ViewAllBarbershops)]
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Tenants.AsNoTracking().Include(t => t.Subscription).AsQueryable();
        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<TenantStatus>(status, true, out var parsed))
        {
            query = query.Where(t => t.Status == parsed);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Email,
                t.Phone,
                status = t.Status.ToString().ToLowerInvariant(),
                t.OwnerUserId,
                t.ApprovedAt,
                t.CreatedAt,
                subscription = t.Subscription == null ? null : new
                {
                    plan = t.Subscription.Plan,
                    status = t.Subscription.Status.ToString().ToLowerInvariant(),
                    trialEndsAt = t.Subscription.TrialEndsAt
                }
            })
            .ToListAsync(cancellationToken);

        return Ok(new { total, page, pageSize, items });
    }

    /// <summary>
    /// Catálogo público de barbearias aprovadas (sem assinatura/faturamento).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("discover")]
    public async Task<IActionResult> Discover(CancellationToken cancellationToken)
    {
        var tenants = await db.Tenants.AsNoTracking()
            .Where(t => t.IsActive && t.Status == TenantStatus.Approved)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

        return Ok(tenants.Select(MapPublicSummary));
    }

    /// <summary>
    /// Detalhe público: contato, endereço, horários, barbeiros e serviços (sem billing).
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{id:guid}/public")]
    public async Task<IActionResult> GetPublic(Guid id, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.AsNoTracking()
            .FirstOrDefaultAsync(
                t => t.Id == id && t.IsActive && t.Status == TenantStatus.Approved,
                cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        var barbers = await db.BarberProfiles.AsNoTracking()
            .Where(b => b.TenantId == id && b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new
            {
                b.Id,
                b.Name,
                b.Bio,
                b.AvatarUrl
            })
            .ToListAsync(cancellationToken);

        var services = await db.Services.AsNoTracking()
            .Where(s => s.TenantId == id && s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new
            {
                s.Id,
                s.Name,
                s.Description,
                s.Category,
                s.DurationMinutes,
                s.Price
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            shop = MapPublicSummary(tenant),
            barbers,
            services
        });
    }

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        if (!User.IsSuperAdmin() && User.GetTenantId() != id)
        {
            return NotFound();
        }

        var tenant = await db.Tenants.AsNoTracking()
            .Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        return tenant is null ? NotFound() : Ok(Map(tenant));
    }

    [Authorize(Policy = Permissions.ManageBarbershops)]
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        tenant.Approve();
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(tenant));
    }

    [Authorize(Policy = Permissions.ManageBarbershops)]
    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        tenant.Reject();
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(tenant));
    }

    [Authorize(Policy = Permissions.ManageBarbershops)]
    [HttpPost("{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        tenant.Suspend();
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(tenant));
    }

    [Authorize(Policy = Permissions.ManageBarbershops)]
    [HttpPost("{id:guid}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid id, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        tenant.Reactivate();
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(tenant));
    }

    public sealed record UpdateTenantProfileRequest(
        string Name,
        string Email,
        string Phone,
        JsonElement? Address = null,
        JsonElement? BusinessHours = null);

    [Authorize(Policy = Permissions.ManageBarbershops)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProfile(
        Guid id,
        [FromBody] UpdateTenantProfileRequest request,
        CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.Include(t => t.Subscription)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Phone))
        {
            return BadRequest(new { error = "Nome, e-mail e telefone são obrigatórios." });
        }

        var addressJson = request.Address?.GetRawText() ?? tenant.AddressJson;
        var hoursJson = request.BusinessHours?.GetRawText() ?? tenant.BusinessHoursJson;
        tenant.UpdateProfile(request.Name, request.Email, request.Phone, addressJson, hoursJson);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(tenant));
    }

    [Authorize(Policy = Permissions.ManageBarbershopSettings)]
    [HttpPut("{id:guid}/settings")]
    public async Task<IActionResult> UpdateSettings(
        Guid id,
        [FromBody] JsonElement settings,
        CancellationToken cancellationToken)
    {
        if (User.GetTenantId() != id && !User.IsSuperAdmin())
        {
            return NotFound();
        }

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
        if (tenant is null)
        {
            return NotFound();
        }

        tenant.UpdateSettings(settings.GetRawText());
        await db.SaveChangesAsync(cancellationToken);
        return Ok(Map(tenant));
    }

    private static object Map(Domain.Entities.Tenant t) => new
    {
        t.Id,
        t.Name,
        t.Email,
        t.Phone,
        status = t.Status.ToString().ToLowerInvariant(),
        t.OwnerUserId,
        t.ApprovedAt,
        address = JsonDocument.Parse(t.AddressJson).RootElement,
        businessHours = JsonDocument.Parse(t.BusinessHoursJson).RootElement,
        settings = JsonDocument.Parse(t.SettingsJson).RootElement,
        subscription = t.Subscription == null ? null : new
        {
            plan = t.Subscription.Plan,
            status = t.Subscription.Status.ToString().ToLowerInvariant(),
            trialEndsAt = t.Subscription.TrialEndsAt,
            currentPeriodEnd = t.Subscription.CurrentPeriodEnd
        }
    };

    /// <summary>Projeção pública — nunca inclui subscription/settings/owner.</summary>
    private static object MapPublicSummary(Domain.Entities.Tenant t) => new
    {
        t.Id,
        t.Name,
        t.Email,
        t.Phone,
        address = SafeJson(t.AddressJson),
        businessHours = SafeJson(t.BusinessHoursJson)
    };

    private static object SafeJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new { };
        }

        try
        {
            return JsonDocument.Parse(json).RootElement.Clone();
        }
        catch (JsonException)
        {
            return new { };
        }
    }
}
