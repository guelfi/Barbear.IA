using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Common;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Entities;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/barbers")]
[Authorize]
public sealed class BarbersController(AppDbContext db) : ControllerBase
{
    public sealed record UpsertBarberRequest(
        string Name,
        string Email,
        string Phone,
        string? Bio = null,
        Guid? UserId = null,
        IReadOnlyList<Guid>? ServiceIds = null);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        if (!User.HasClaim("permission", Permissions.ViewBarbers) &&
            !User.HasClaim("permission", Permissions.ViewServices))
        {
            return Forbid();
        }

        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var items = await db.BarberProfiles.AsNoTracking()
            .Where(b => b.TenantId == tenantId && b.IsActive)
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

        return Ok(items.Select(b => new
        {
            b.Id,
            b.Name,
            b.Email,
            b.Phone,
            b.Bio,
            b.AvatarUrl,
            b.UserId,
            serviceIds = b.GetServiceIds(),
            b.IsActive
        }));
    }

    [Authorize(Policy = Permissions.ManageBarbers)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertBarberRequest request, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (phone is null)
        {
            return BadRequest(new { error = "Telefone inválido." });
        }

        var entity = BarberProfile.Create(tenantId.Value, request.Name, request.Email, phone, request.UserId, request.Bio);
        if (request.ServiceIds is { Count: > 0 })
        {
            entity.SetServices(request.ServiceIds);
        }

        db.BarberProfiles.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(List), new { id = entity.Id }, new { entity.Id });
    }

    [Authorize(Policy = Permissions.ManageBarbers)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertBarberRequest request, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var entity = await db.BarberProfiles.FirstOrDefaultAsync(b => b.Id == id && b.TenantId == tenantId, cancellationToken);
        if (entity is null)
        {
            return NotFound();
        }

        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (phone is null)
        {
            return BadRequest(new { error = "Telefone inválido." });
        }

        entity.Update(request.Name, request.Email, phone, request.Bio, entity.AvatarUrl);
        if (request.ServiceIds is not null)
        {
            entity.SetServices(request.ServiceIds);
        }

        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { entity.Id });
    }

    [Authorize(Policy = Permissions.ManageBarbers)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var entity = await db.BarberProfiles.FirstOrDefaultAsync(b => b.Id == id && b.TenantId == tenantId, cancellationToken);
        if (entity is null)
        {
            return NotFound();
        }

        entity.SoftDelete();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
