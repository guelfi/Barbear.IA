using Barbear.IA.Domain.Common;
using Barbear.IA.Domain.Enums;

namespace Barbear.IA.Domain.Entities;

public class TenantSubscription : Entity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public string Plan { get; private set; } = "pro-monthly";
    public SubscriptionStatus Status { get; private set; } = SubscriptionStatus.Trial;
    public DateTimeOffset? TrialEndsAt { get; private set; }
    public DateTimeOffset CurrentPeriodStart { get; private set; }
    public DateTimeOffset CurrentPeriodEnd { get; private set; }
    public string? StripeCustomerId { get; private set; }
    public string? StripeSubscriptionId { get; private set; }
    public bool CancelAtPeriodEnd { get; private set; }

    public Tenant? Tenant { get; private set; }

    private TenantSubscription()
    {
    }

    public static TenantSubscription CreateTrial(Guid tenantId, int trialDays = 7)
    {
        var now = DateTimeOffset.UtcNow;
        return new TenantSubscription
        {
            TenantId = tenantId,
            Plan = "pro-monthly",
            Status = SubscriptionStatus.Trial,
            TrialEndsAt = now.AddDays(trialDays),
            CurrentPeriodStart = now,
            CurrentPeriodEnd = now.AddDays(trialDays)
        };
    }

    public void ApplyStripe(
        string plan,
        SubscriptionStatus status,
        string? customerId,
        string? subscriptionId,
        DateTimeOffset periodStart,
        DateTimeOffset periodEnd,
        bool cancelAtPeriodEnd)
    {
        Plan = plan;
        Status = status;
        StripeCustomerId = customerId;
        StripeSubscriptionId = subscriptionId;
        CurrentPeriodStart = periodStart;
        CurrentPeriodEnd = periodEnd;
        CancelAtPeriodEnd = cancelAtPeriodEnd;
        Touch();
    }
}

