using System.Text;
using System.Text.Json;
using Barbear.IA.Infrastructure.Evolution;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/webhooks/evolution")]
public sealed class EvolutionWebhookController(
    IOptions<EvolutionOptions> options,
    ILogger<EvolutionWebhookController> logger) : ControllerBase
{
    private static readonly HashSet<string> AllowedEvents = new(StringComparer.OrdinalIgnoreCase)
    {
        "MESSAGES_UPSERT",
        "CONNECTION_UPDATE",
        "QRCODE_UPDATED"
    };

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        var secret = options.Value.WebhookSecret;
        if (string.IsNullOrWhiteSpace(secret))
        {
            return Unauthorized();
        }

        var header = Request.Headers["x-webhook-secret"].FirstOrDefault()
                     ?? Request.Headers["Authorization"].FirstOrDefault();
        if (!string.Equals(header, secret, StringComparison.Ordinal) &&
            !string.Equals(header, $"Bearer {secret}", StringComparison.Ordinal))
        {
            return Unauthorized();
        }

        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var body = await reader.ReadToEndAsync(cancellationToken);
        if (string.IsNullOrWhiteSpace(body))
        {
            return BadRequest();
        }

        using var doc = JsonDocument.Parse(body);
        var eventName = doc.RootElement.TryGetProperty("event", out var ev)
            ? ev.GetString()
            : null;

        if (eventName is null || !AllowedEvents.Contains(eventName))
        {
            return Ok(new { ignored = true });
        }

        logger.LogInformation("Webhook Evolution recebido: {Event}", eventName);
        return Ok(new { received = true });
    }
}
