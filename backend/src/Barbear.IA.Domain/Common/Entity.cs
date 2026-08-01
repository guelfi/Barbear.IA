namespace Barbear.IA.Domain.Common;

public abstract class Entity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTimeOffset CreatedAt { get; protected set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; protected set; }
    public DateTimeOffset? DeletedAt { get; protected set; }
    public bool IsActive { get; protected set; } = true;

    public void SoftDelete()
    {
        IsActive = false;
        DeletedAt = DateTimeOffset.UtcNow;
        Touch();
    }

    public void Activate()
    {
        IsActive = true;
        DeletedAt = null;
        Touch();
    }

    protected void Touch() => UpdatedAt = DateTimeOffset.UtcNow;
}
