using Barbear.IA.Infrastructure.Evolution;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace Barbear.IA.UnitTests;

public class OtpServiceTests
{
    private sealed class FakeEvolution : IEvolutionApiClient
    {
        public bool IsEnabled => true;
        public List<string> Sent { get; } = [];

        public Task SendTextAsync(string phoneE164, string message, CancellationToken cancellationToken = default)
        {
            Sent.Add($"{phoneE164}:{message}");
            return Task.CompletedTask;
        }

        public Task<bool> IsInstanceConnectedAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(true);
    }

    private static IConfiguration Config(params (string Key, string Value)[] pairs)
    {
        return new ConfigurationBuilder().AddInMemoryCollection(
            pairs.ToDictionary(p => p.Key, p => (string?)p.Value)).Build();
    }

    [Fact]
    public async Task RequestAndVerify_Succeeds_WithoutLoggingPlainCodeInCacheValueAsCode()
    {
        var cache = new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
        var evolution = new FakeEvolution();
        var sut = new OtpService(cache, evolution, Config(), NullLogger<OtpService>.Instance);

        var request = await sut.RequestAsync("11988887777", "verify_phone");
        Assert.True(request.Success);
        Assert.Single(evolution.Sent);

        var code = System.Text.RegularExpressions.Regex.Match(evolution.Sent[0], @"\b(\d{6})\b").Groups[1].Value;
        Assert.False(string.IsNullOrEmpty(code));

        var verify = await sut.VerifyAsync("11988887777", "verify_phone", code);
        Assert.True(verify.Success);
    }

    [Fact]
    public async Task Request_WhenEvolutionDisabled_UsesSandboxCode()
    {
        var cache = new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
        var sut = new OtpService(
            cache,
            new NullEvolutionApiClient(),
            Config(("Otp:SandboxEnabled", "true"), ("Otp:SandboxCode", "123456")),
            NullLogger<OtpService>.Instance);

        var result = await sut.RequestAsync("11988887777", "verify_phone");
        Assert.True(result.Success);
        Assert.Equal("123456", result.DevCode);

        var verify = await sut.VerifyAsync("11988887777", "verify_phone", "123456");
        Assert.True(verify.Success);
    }

    [Fact]
    public async Task Request_WhenEvolutionDisabledAndSandboxOff_FailsGracefully()
    {
        var cache = new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
        var sut = new OtpService(
            cache,
            new NullEvolutionApiClient(),
            Config(("Otp:SandboxEnabled", "false")),
            NullLogger<OtpService>.Instance);

        var result = await sut.RequestAsync("11988887777", "verify_phone");
        Assert.False(result.Success);
    }
}
