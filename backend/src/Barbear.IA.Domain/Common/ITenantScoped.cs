namespace Barbear.IA.Domain.Common;

public interface ITenantScoped
{
    Guid TenantId { get; }
}
