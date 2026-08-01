using Barbear.IA.Domain.Common;

namespace Barbear.IA.Domain.Entities;

public class Notification : Entity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid UserId { get; private set; }
    public string Type { get; private set; } = "system";
    public string Title { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }
    public DateTimeOffset? ReadAt { get; private set; }

    private Notification()
    {
    }

    public static Notification Create(Guid tenantId, Guid userId, string type, string title, string message)
    {
        return new Notification
        {
            TenantId = tenantId,
            UserId = userId,
            Type = string.IsNullOrWhiteSpace(type) ? "system" : type.Trim().ToLowerInvariant(),
            Title = title.Trim(),
            Message = message.Trim()
        };
    }

    public void MarkRead()
    {
        if (IsRead)
        {
            return;
        }

        IsRead = true;
        ReadAt = DateTimeOffset.UtcNow;
        Touch();
    }
}
