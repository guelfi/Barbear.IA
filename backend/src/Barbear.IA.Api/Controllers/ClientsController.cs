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
[Route("api/v1/clients")]
[Authorize]
public sealed class ClientsController(AppDbContext db) : ControllerBase
{
    public sealed record UpsertClientRequest(
        string Name,
        string Email,
        string Phone,
        string? Notes = null,
        Guid? UserId = null);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        if (User.HasClaim("permission", Permissions.ViewClients))
        {
            var items = await db.ClientProfiles.AsNoTracking()
                .Where(c => c.TenantId == tenantId && c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name, c.Email, c.Phone, c.Notes, c.UserId, c.IsActive })
                .ToListAsync(cancellationToken);
            return Ok(items);
        }

        if (User.HasClaim("permission", Permissions.ViewAssignedClients))
        {
            var barberId = User.GetBarberId();
            if (barberId is null)
            {
                return Forbid();
            }

            var clientIds = await db.Appointments.AsNoTracking()
                .Where(a => a.TenantId == tenantId && a.BarberId == barberId && a.IsActive)
                .Select(a => a.ClientId)
                .Distinct()
                .ToListAsync(cancellationToken);

            var assigned = await db.ClientProfiles.AsNoTracking()
                .Where(c => c.TenantId == tenantId && clientIds.Contains(c.Id) && c.IsActive)
                .OrderBy(c => c.Name)
                .Select(c => new { c.Id, c.Name, c.Email, c.Phone, c.Notes, c.UserId, c.IsActive })
                .ToListAsync(cancellationToken);
            return Ok(assigned);
        }

        return Forbid();
    }

    [Authorize(Policy = Permissions.ManageClients)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UpsertClientRequest request, CancellationToken cancellationToken)
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

        // Walk-in: UserId pode ser null (D4)
        var entity = ClientProfile.Create(tenantId.Value, request.Name, request.Email, phone, request.UserId, request.Notes);
        db.ClientProfiles.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(List), new { id = entity.Id }, new { entity.Id });
    }

    [Authorize(Policy = Permissions.ManageClients)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertClientRequest request, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var entity = await db.ClientProfiles.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId, cancellationToken);
        if (entity is null)
        {
            return NotFound();
        }

        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (phone is null)
        {
            return BadRequest(new { error = "Telefone inválido." });
        }

        entity.Update(request.Name, request.Email, phone, request.Notes, entity.PreferencesJson);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(new { entity.Id });
    }

    [Authorize(Policy = Permissions.ManageClients)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var entity = await db.ClientProfiles.FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenantId, cancellationToken);
        if (entity is null)
        {
            return NotFound();
        }

        entity.SoftDelete();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }
}
