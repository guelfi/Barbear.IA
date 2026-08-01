using Barbear.IA.Domain.Entities;
using Barbear.IA.Domain.Enums;

namespace Barbear.IA.UnitTests;

public class TenantTests
{
    [Fact]
    public void CreatePending_AttachesTrialSubscription_AndApproves()
    {
        var ownerId = Guid.NewGuid();
        var tenant = Tenant.CreatePending("Barbearia Teste", "dono@teste.com", "+5511999999999", ownerId);
        var subscription = TenantSubscription.CreateTrial(tenant.Id);
        tenant.AttachSubscription(subscription);

        Assert.Equal(TenantStatus.Pending, tenant.Status);
        Assert.Equal(SubscriptionStatus.Trial, tenant.Subscription!.Status);

        tenant.Approve();
        Assert.Equal(TenantStatus.Approved, tenant.Status);
        Assert.NotNull(tenant.ApprovedAt);
    }
}
