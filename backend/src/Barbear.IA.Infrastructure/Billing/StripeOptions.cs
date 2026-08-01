namespace Barbear.IA.Infrastructure.Billing;

public sealed class StripeOptions
{
    public const string SectionName = "Stripe";

    public bool Enabled { get; set; }
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string PriceIdMonthly { get; set; } = string.Empty;
    public string PriceIdYearly { get; set; } = string.Empty;
    public string SuccessUrl { get; set; } = "http://192.168.15.119/barbear-ia/";
    public string CancelUrl { get; set; } = "http://192.168.15.119/barbear-ia/";
}
