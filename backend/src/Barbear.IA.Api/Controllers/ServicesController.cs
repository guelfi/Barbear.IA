using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Entities;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/services")]
[Authorize]
public sealed class ServicesController(AppDbContext db) : ControllerBase
{
    public sealed record UpsertServiceRequest(
        string Name,
        decimal Price,
        int DurationMinutes,
        string? Category = null,
        string? Description = null);

    [Authorize(Policy = Permissions.ViewServices)]
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] Guid? tenantId, CancellationToken cancellationToken)
    {
        var resolvedTenantId = ResolveTenantId(tenantId);
        if (resolvedTenantId is null)
        {
            return Forbid();
        }

        var items = await db.Services.AsNoTracking()
            .Where(s => s.TenantId == resolvedTenantId && s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new
            {
                s.Id,
                s.TenantId,
                s.Name,
                s.Description,
                s.Category,
                s.DurationMinutes,
                s.Price,
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt
            })
            .ToListAsync(cancellationToken);
        return Ok(items);
    }

    [Authorize(Policy = Permissions.ManageServices)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertServiceRequest request, CancellationToken cancellationToken)
    {
        var tenantId = ResolveTenantId(requestTenantId: null);
        if (tenantId is null)
        {
            return Forbid();
        }

        try
        {
            var entity = ServiceOffering.Create(
                tenantId.Value,
                request.Name,
                request.Price,
                request.DurationMinutes,
                request.Category ?? "geral",
                request.Description);
            db.Services.Add(entity);
            await db.SaveChangesAsync(cancellationToken);
            return CreatedAtAction(nameof(List), new { id = entity.Id }, new { entity.Id });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = Permissions.ManageServices)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertServiceRequest request, CancellationToken cancellationToken)
    {
        var tenantId = ResolveTenantId(requestTenantId: null);
        if (tenantId is null)
        {
            return Forbid();
        }

        var entity = await db.Services.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId, cancellationToken);
        if (entity is null)
        {
            return NotFound();
        }

        try
        {
            entity.Update(request.Name, request.Description, request.Category ?? entity.Category, request.DurationMinutes, request.Price);
            await db.SaveChangesAsync(cancellationToken);
            return Ok(new { entity.Id });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Policy = Permissions.ManageServices)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = ResolveTenantId(requestTenantId: null);
        if (tenantId is null)
        {
            return Forbid();
        }

        var entity = await db.Services.FirstOrDefaultAsync(s => s.Id == id && s.TenantId == tenantId, cancellationToken);
        if (entity is null)
        {
            return NotFound();
        }

        entity.SoftDelete();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>Admin usa tenant do token; SA pode informar tenantId na query (leitura).</summary>
    private Guid? ResolveTenantId(Guid? requestTenantId)
    {
        var tokenTenant = User.GetTenantId();
        if (tokenTenant.HasValue)
        {
            return tokenTenant;
        }

        if (User.IsSuperAdmin())
        {
            return requestTenantId;
        }

        return null;
    }
}
