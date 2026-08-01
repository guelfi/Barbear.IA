namespace Barbear.IA.Domain.Entities;

public class MessageOutbox
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Channel { get; set; } = "whatsapp";
    public string ToPhone { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending|sent|failed
    public int Attempts { get; set; }
    public string? LastError { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? SentAt { get; set; }
    public DateTimeOffset? NextAttemptAt { get; set; }
}
