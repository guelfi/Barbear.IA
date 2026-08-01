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

    [AllowAnonymous]
    [HttpGet("discover")]
    public async Task<IActionResult> Discover(CancellationToken cancellationToken)
    {
        var items = await db.Tenants.AsNoTracking()
            .Where(t => t.IsActive && t.Status == TenantStatus.Approved)
            .OrderBy(t => t.Name)
            .Select(t => new { t.Id, t.Name, t.Phone })
            .ToListAsync(cancellationToken);
        return Ok(items);
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
}
