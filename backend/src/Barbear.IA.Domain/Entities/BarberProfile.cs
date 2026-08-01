using System.Text.Json;
using Barbear.IA.Domain.Common;

namespace Barbear.IA.Domain.Entities;

public class BarberProfile : Entity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid? UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Bio { get; private set; }
    public string? AvatarUrl { get; private set; }
    public string ServiceIdsJson { get; private set; } = "[]";
    public string WorkingHoursJson { get; private set; } = "{}";

    private BarberProfile()
    {
    }

    public static BarberProfile Create(
        Guid tenantId,
        string name,
        string email,
        string phone,
        Guid? userId = null,
        string? bio = null)
    {
        return new BarberProfile
        {
            TenantId = tenantId,
            UserId = userId,
            Name = name.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            Phone = phone.Trim(),
            Bio = bio
        };
    }

    public void Update(string name, string email, string phone, string? bio, string? avatarUrl)
    {
        Name = name.Trim();
        Email = email.Trim().ToLowerInvariant();
        Phone = phone.Trim();
        Bio = bio;
        AvatarUrl = avatarUrl;
        Touch();
    }

    public void SetServices(IEnumerable<Guid> serviceIds)
    {
        ServiceIdsJson = JsonSerializer.Serialize(serviceIds.Distinct());
        Touch();
    }

    public void SetWorkingHours(string workingHoursJson)
    {
        WorkingHoursJson = workingHoursJson;
        Touch();
    }

    public IReadOnlyList<Guid> GetServiceIds() =>
        JsonSerializer.Deserialize<List<Guid>>(ServiceIdsJson) ?? [];
}
