using Barbear.IA.Domain.Common;

namespace Barbear.IA.Domain.Entities;

public class ClientProfile : Entity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid? UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Notes { get; private set; }
    public string PreferencesJson { get; private set; } = "{}";

    private ClientProfile()
    {
    }

    public static ClientProfile Create(
        Guid tenantId,
        string name,
        string email,
        string phone,
        Guid? userId = null,
        string? notes = null)
    {
        return new ClientProfile
        {
            TenantId = tenantId,
            UserId = userId,
            Name = name.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            Phone = phone.Trim(),
            Notes = notes,
            PreferencesJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                notifications = new { whatsapp = true, sms = false, email = true }
            })
        };
    }

    public void Update(string name, string email, string phone, string? notes, string preferencesJson)
    {
        Name = name.Trim();
        Email = email.Trim().ToLowerInvariant();
        Phone = phone.Trim();
        Notes = notes;
        PreferencesJson = preferencesJson;
        Touch();
    }
}
