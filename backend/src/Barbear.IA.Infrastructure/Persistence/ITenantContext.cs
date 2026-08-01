namespace Barbear.IA.Infrastructure.Persistence;

public interface ITenantContext
{
    Guid? TenantId { get; }
    bool IsSuperAdmin { get; }
}

public sealed class TenantContext : ITenantContext
{
    public Guid? TenantId { get; set; }
    public bool IsSuperAdmin { get; set; }
}
