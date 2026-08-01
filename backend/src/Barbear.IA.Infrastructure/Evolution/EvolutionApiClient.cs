using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Barbear.IA.Infrastructure.Evolution;

public sealed class EvolutionApiClient(
    HttpClient httpClient,
    IOptions<EvolutionOptions> options,
    ILogger<EvolutionApiClient> logger) : IEvolutionApiClient
{
    private readonly EvolutionOptions _options = options.Value;

    public bool IsEnabled =>
        _options.Enabled &&
        !string.IsNullOrWhiteSpace(_options.BaseUrl) &&
        !string.IsNullOrWhiteSpace(_options.ApiKey);

    public async Task SendTextAsync(string phoneE164, string message, CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
        {
            logger.LogWarning("Evolution desabilitada; mensagem para {Phone} ignorada.", MaskPhone(phoneE164));
            return;
        }

        var number = phoneE164.TrimStart('+');
        var instance = string.IsNullOrWhiteSpace(_options.InstanceName) ? _options.InstanceId : _options.InstanceName;
        var path = $"/message/sendText/{instance}";

        using var request = new HttpRequestMessage(HttpMethod.Post, path);
        request.Headers.Add("apikey", _options.ApiKey);
        request.Content = JsonContent.Create(new
        {
            number,
            text = message
        });

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            logger.LogError("Falha Evolution sendText ({Status}): {Body}", (int)response.StatusCode, body);
            response.EnsureSuccessStatusCode();
        }
    }

    public async Task<bool> IsInstanceConnectedAsync(CancellationToken cancellationToken = default)
    {
        if (!IsEnabled)
        {
            return false;
        }

        var instance = string.IsNullOrWhiteSpace(_options.InstanceName) ? _options.InstanceId : _options.InstanceName;
        using var request = new HttpRequestMessage(HttpMethod.Get, $"/instance/connectionState/{instance}");
        request.Headers.Add("apikey", _options.ApiKey);

        using var response = await httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        if (doc.RootElement.TryGetProperty("instance", out var inst) &&
            inst.TryGetProperty("state", out var state))
        {
            return string.Equals(state.GetString(), "open", StringComparison.OrdinalIgnoreCase);
        }

        return false;
    }

    private static string MaskPhone(string phone) =>
        phone.Length <= 4 ? "****" : $"***{phone[^4..]}";
}
