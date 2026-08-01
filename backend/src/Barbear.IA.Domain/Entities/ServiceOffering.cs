using Barbear.IA.Domain.Common;

namespace Barbear.IA.Domain.Entities;

public class ServiceOffering : Entity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Category { get; private set; } = "geral";
    public int DurationMinutes { get; private set; } = 30;
    public decimal Price { get; private set; }

    private ServiceOffering()
    {
    }

    public static ServiceOffering Create(
        Guid tenantId,
        string name,
        decimal price,
        int durationMinutes,
        string category = "geral",
        string? description = null)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(durationMinutes);
        ArgumentOutOfRangeException.ThrowIfNegative(price);

        return new ServiceOffering
        {
            TenantId = tenantId,
            Name = name.Trim(),
            Price = price,
            DurationMinutes = durationMinutes,
            Category = string.IsNullOrWhiteSpace(category) ? "geral" : category.Trim().ToLowerInvariant(),
            Description = description
        };
    }

    public void Update(string name, string? description, string category, int durationMinutes, decimal price)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(durationMinutes);
        ArgumentOutOfRangeException.ThrowIfNegative(price);

        Name = name.Trim();
        Description = description;
        Category = string.IsNullOrWhiteSpace(category) ? "geral" : category.Trim().ToLowerInvariant();
        DurationMinutes = durationMinutes;
        Price = price;
        Touch();
    }
}
