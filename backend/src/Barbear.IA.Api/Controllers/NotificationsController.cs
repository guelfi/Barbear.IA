using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Entities;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/notifications")]
[Authorize]
public sealed class NotificationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        var tenantId = User.GetTenantId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var query = db.Notifications.AsNoTracking().Where(n => n.UserId == userId && n.IsActive);
        if (tenantId.HasValue)
        {
            query = query.Where(n => n.TenantId == tenantId);
        }

        var items = await query.OrderByDescending(n => n.CreatedAt)
            .Take(100)
            .Select(n => new
            {
                n.Id,
                n.Type,
                n.Title,
                n.Message,
                n.IsRead,
                n.ReadAt,
                n.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Ok(items);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);
        if (notification is null)
        {
            return NotFound();
        }

        notification.MarkRead();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var unread = await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);
        foreach (var n in unread)
        {
            n.MarkRead();
        }

        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var notification = await db.Notifications
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId, cancellationToken);
        if (notification is null)
        {
            return NotFound();
        }

        notification.SoftDelete();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>Uso interno/admin para criar notificação (também usado por fluxos de agenda).</summary>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateNotificationRequest request,
        CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId() ?? request.TenantId;
        if (tenantId is null || !User.IsSuperAdmin() && User.GetTenantId() != tenantId)
        {
            return Forbid();
        }

        var entity = Notification.Create(tenantId.Value, request.UserId, request.Type, request.Title, request.Message);
        db.Notifications.Add(entity);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(List), new { id = entity.Id }, new { entity.Id });
    }

    public sealed record CreateNotificationRequest(
        Guid UserId,
        string Title,
        string Message,
        string Type = "system",
        Guid? TenantId = null);
}
