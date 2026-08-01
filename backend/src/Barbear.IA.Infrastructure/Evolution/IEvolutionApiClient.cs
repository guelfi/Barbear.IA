namespace Barbear.IA.Infrastructure.Evolution;

public interface IEvolutionApiClient
{
    bool IsEnabled { get; }
    Task SendTextAsync(string phoneE164, string message, CancellationToken cancellationToken = default);
    Task<bool> IsInstanceConnectedAsync(CancellationToken cancellationToken = default);
}

public sealed class NullEvolutionApiClient : IEvolutionApiClient
{
    public bool IsEnabled => false;

    public Task SendTextAsync(string phoneE164, string message, CancellationToken cancellationToken = default) =>
        Task.CompletedTask;

    public Task<bool> IsInstanceConnectedAsync(CancellationToken cancellationToken = default) =>
        Task.FromResult(false);
}
