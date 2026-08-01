namespace Barbear.IA.Infrastructure.Evolution;

public sealed class EvolutionOptions
{
    public const string SectionName = "Evolution";

    public bool Enabled { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string InstanceId { get; set; } = string.Empty;
    public string InstanceName { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
}
