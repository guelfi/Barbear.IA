using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Billing;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/billing")]
public sealed class BillingController(
    AppDbContext db,
    IOptions<StripeOptions> stripeOptions) : ControllerBase
{
    public sealed record CheckoutRequest(string Plan = "pro-monthly");

    [Authorize(Policy = Permissions.ManageBarbershopSettings)]
    [HttpGet("subscription")]
    public async Task<IActionResult> GetSubscription(CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var sub = await db.TenantSubscriptions.AsNoTracking()
            .FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);
        if (sub is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            plan = sub.Plan,
            status = sub.Status.ToString().ToLowerInvariant(),
            trialEndsAt = sub.TrialEndsAt,
            currentPeriodEnd = sub.CurrentPeriodEnd,
            cancelAtPeriodEnd = sub.CancelAtPeriodEnd,
            stripeEnabled = stripeOptions.Value.Enabled
        });
    }

    [Authorize(Policy = Permissions.ManageBarbershopSettings)]
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request, CancellationToken cancellationToken)
    {
        var tenantId = User.GetTenantId();
        if (tenantId is null)
        {
            return Forbid();
        }

        var opts = stripeOptions.Value;
        if (!opts.Enabled || string.IsNullOrWhiteSpace(opts.SecretKey))
        {
            // Sandbox local: marca assinatura ativa sem Stripe real
            var sub = await db.TenantSubscriptions.FirstOrDefaultAsync(s => s.TenantId == tenantId, cancellationToken);
            if (sub is null)
            {
                return NotFound();
            }

            var now = DateTimeOffset.UtcNow;
            sub.ApplyStripe(
                request.Plan,
                SubscriptionStatus.Active,
                $"cus_local_{tenantId:N}"[..24],
                $"sub_local_{tenantId:N}"[..24],
                now,
                now.AddMonths(request.Plan.Contains("year", StringComparison.OrdinalIgnoreCase) ? 12 : 1),
                false);
            await db.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                mode = "local_sandbox",
                checkoutUrl = opts.SuccessUrl,
                message = "Stripe desabilitado — assinatura ativada em sandbox local."
            });
        }

        // Placeholder: integração Stripe Checkout real quando SecretKey estiver configurada.
        return Ok(new
        {
            mode = "stripe",
            checkoutUrl = $"{opts.SuccessUrl}?checkout=pending&plan={Uri.EscapeDataString(request.Plan)}",
            message = "Configure Stripe Checkout Session no deploy (E9)."
        });
    }

    [Authorize(Policy = Permissions.ViewBilling)]
    [HttpGet("revenue")]
    public async Task<IActionResult> PlatformRevenue(CancellationToken cancellationToken)
    {
        var active = await db.TenantSubscriptions.CountAsync(
            s => s.Status == SubscriptionStatus.Active, cancellationToken);
        var trial = await db.TenantSubscriptions.CountAsync(
            s => s.Status == SubscriptionStatus.Trial, cancellationToken);

        return Ok(new
        {
            activeSubscriptions = active,
            trialSubscriptions = trial,
            estimatedMrr = active * 99m
        });
    }

    [AllowAnonymous]
    [HttpPost("webhook/stripe")]
    public async Task<IActionResult> StripeWebhook(CancellationToken cancellationToken)
    {
        var opts = stripeOptions.Value;
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var payload = await reader.ReadToEndAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(opts.WebhookSecret))
        {
            var signature = Request.Headers["Stripe-Signature"].FirstOrDefault() ?? string.Empty;
            // Validação simplificada (HMAC) — trocar pelo Stripe.net no go-live
            var expected = Convert.ToHexString(
                HMACSHA256.HashData(Encoding.UTF8.GetBytes(opts.WebhookSecret), Encoding.UTF8.GetBytes(payload)));
            if (!signature.Contains(expected, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(signature, opts.WebhookSecret, StringComparison.Ordinal))
            {
                return Unauthorized();
            }
        }

        if (string.IsNullOrWhiteSpace(payload))
        {
            return BadRequest();
        }

        using var doc = JsonDocument.Parse(payload);
        var type = doc.RootElement.TryGetProperty("type", out var t) ? t.GetString() : null;
        if (type is "customer.subscription.updated" or "customer.subscription.deleted" or "invoice.paid")
        {
            // Idempotência leve: apenas registra evento processável
            return Ok(new { received = true, type });
        }

        return Ok(new { received = true, ignored = true, type });
    }
}
