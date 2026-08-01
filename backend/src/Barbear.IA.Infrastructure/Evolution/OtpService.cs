using System.Security.Cryptography;
using System.Text;
using Barbear.IA.Domain.Common;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Barbear.IA.Infrastructure.Evolution;

public interface IOtpService
{
    Task<(bool Success, string? Error, string? DevCode)> RequestAsync(
        string phone,
        string purpose,
        CancellationToken cancellationToken = default);

    Task<(bool Success, string? Error)> VerifyAsync(
        string phone,
        string purpose,
        string code,
        CancellationToken cancellationToken = default);
}

public sealed class OtpService(
    IDistributedCache cache,
    IEvolutionApiClient evolution,
    IConfiguration configuration,
    ILogger<OtpService> logger) : IOtpService
{
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);
    private const int MaxAttempts = 5;

    public async Task<(bool Success, string? Error, string? DevCode)> RequestAsync(
        string phone,
        string purpose,
        CancellationToken cancellationToken = default)
    {
        var e164 = PhoneNormalizer.ToE164Br(phone);
        if (e164 is null)
        {
            return (false, "Telefone inválido.", null);
        }

        var sandbox = configuration.GetValue("Otp:SandboxEnabled", true) && !evolution.IsEnabled;
        var sandboxCode = configuration["Otp:SandboxCode"] ?? "123456";

        string code;
        string? devCode = null;

        if (sandbox)
        {
            // Contorno sem Evolution: OTP fixo documentado para validação manual
            code = sandboxCode;
            devCode = sandboxCode;
            logger.LogWarning(
                "OTP sandbox (Evolution off): phone={Phone} purpose={Purpose} code={Code}",
                Mask(e164), purpose, code);
        }
        else if (!evolution.IsEnabled)
        {
            return (false, "Canal WhatsApp indisponível.", null);
        }
        else
        {
            code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        }

        var payload = $"{Hash(code)}|{0}|{DateTimeOffset.UtcNow.Add(Ttl).ToUnixTimeSeconds()}";
        await cache.SetStringAsync(Key(e164, purpose), payload, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = Ttl
        }, cancellationToken);

        if (!sandbox)
        {
            await evolution.SendTextAsync(
                e164,
                $"Barbear.IA: seu código é {code}. Válido por 5 minutos.",
                cancellationToken);
        }

        logger.LogInformation("OTP solicitado para {Phone} purpose={Purpose} sandbox={Sandbox}",
            Mask(e164), purpose, sandbox);
        return (true, null, devCode);
    }

    public async Task<(bool Success, string? Error)> VerifyAsync(
        string phone,
        string purpose,
        string code,
        CancellationToken cancellationToken = default)
    {
        var e164 = PhoneNormalizer.ToE164Br(phone);
        if (e164 is null || string.IsNullOrWhiteSpace(code))
        {
            return (false, "Código inválido.");
        }

        var key = Key(e164, purpose);
        var stored = await cache.GetStringAsync(key, cancellationToken);
        if (stored is null)
        {
            return (false, "Código inválido ou expirado.");
        }

        var parts = stored.Split('|');
        if (parts.Length != 3 ||
            !int.TryParse(parts[1], out var attempts) ||
            !long.TryParse(parts[2], out var expUnix))
        {
            await cache.RemoveAsync(key, cancellationToken);
            return (false, "Código inválido ou expirado.");
        }

        if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > expUnix || attempts >= MaxAttempts)
        {
            await cache.RemoveAsync(key, cancellationToken);
            return (false, "Código inválido ou expirado.");
        }

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(parts[0]),
                Encoding.UTF8.GetBytes(Hash(code.Trim()))))
        {
            attempts++;
            await cache.SetStringAsync(key, $"{parts[0]}|{attempts}|{parts[2]}", new DistributedCacheEntryOptions
            {
                AbsoluteExpiration = DateTimeOffset.FromUnixTimeSeconds(expUnix)
            }, cancellationToken);
            return (false, "Código inválido ou expirado.");
        }

        await cache.RemoveAsync(key, cancellationToken);
        return (true, null);
    }

    private static string Key(string phone, string purpose) => $"otp:{purpose}:{phone}";

    private static string Hash(string code)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(code));
        return Convert.ToHexString(bytes);
    }

    private static string Mask(string phone) => phone.Length <= 4 ? "****" : $"***{phone[^4..]}";
}
