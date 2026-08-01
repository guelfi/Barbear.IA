using System.Text.Json;
using Barbear.IA.Domain.Common;
using Barbear.IA.Domain.Enums;

namespace Barbear.IA.Domain.Entities;

public class Tenant : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public TenantStatus Status { get; private set; } = TenantStatus.Pending;
    public Guid OwnerUserId { get; private set; }
    public DateTimeOffset? ApprovedAt { get; private set; }
    public string AddressJson { get; private set; } = "{}";
    public string BusinessHoursJson { get; private set; } = "{}";
    public string SettingsJson { get; private set; } = "{}";

    public TenantSubscription? Subscription { get; private set; }

    private Tenant()
    {
    }

    public static Tenant CreatePending(
        string name,
        string email,
        string phone,
        Guid ownerUserId,
        object? address = null,
        object? businessHours = null,
        object? settings = null)
    {
        return new Tenant
        {
            Name = name.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            Phone = phone.Trim(),
            OwnerUserId = ownerUserId,
            Status = TenantStatus.Pending,
            AddressJson = JsonSerializer.Serialize(address ?? new { }),
            BusinessHoursJson = JsonSerializer.Serialize(businessHours ?? new { }),
            SettingsJson = JsonSerializer.Serialize(settings ?? new
            {
                appointmentDuration = 30,
                advanceBookingDays = 30,
                cancellationHours = 2,
                currency = "BRL",
                timezone = "America/Sao_Paulo"
            })
        };
    }

    public void Approve()
    {
        Status = TenantStatus.Approved;
        ApprovedAt = DateTimeOffset.UtcNow;
        Touch();
    }

    public void Reject()
    {
        Status = TenantStatus.Cancelled;
        Touch();
    }

    public void Suspend()
    {
        Status = TenantStatus.Suspended;
        Touch();
    }

    public void Reactivate()
    {
        Status = TenantStatus.Approved;
        Touch();
    }

    public void UpdateProfile(string name, string email, string phone, string addressJson, string businessHoursJson)
    {
        Name = name.Trim();
        Email = email.Trim().ToLowerInvariant();
        Phone = phone.Trim();
        AddressJson = addressJson;
        BusinessHoursJson = businessHoursJson;
        Touch();
    }

    public void UpdateSettings(string settingsJson)
    {
        SettingsJson = settingsJson;
        Touch();
    }

    public void AttachSubscription(TenantSubscription subscription)
    {
        ArgumentNullException.ThrowIfNull(subscription);
        Subscription = subscription;
    }
}
