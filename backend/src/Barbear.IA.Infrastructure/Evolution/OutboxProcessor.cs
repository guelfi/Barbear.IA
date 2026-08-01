using Barbear.IA.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Barbear.IA.Infrastructure.Evolution;

public sealed class OutboxProcessor(
    IServiceScopeFactory scopeFactory,
    ILogger<OutboxProcessor> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessBatchAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Falha no processador de outbox");
            }

            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
        }
    }

    private async Task ProcessBatchAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var evolution = scope.ServiceProvider.GetRequiredService<IEvolutionApiClient>();

        var now = DateTimeOffset.UtcNow;
        var pending = await db.MessageOutbox
            .Where(m => m.Status == "pending" && (m.NextAttemptAt == null || m.NextAttemptAt <= now))
            .OrderBy(m => m.CreatedAt)
            .Take(20)
            .ToListAsync(cancellationToken);

        if (pending.Count == 0)
        {
            return;
        }

        foreach (var message in pending)
        {
            try
            {
                if (!evolution.IsEnabled)
                {
                    message.Status = "failed";
                    message.LastError = "Evolution desabilitada";
                    message.Attempts++;
                    continue;
                }

                await evolution.SendTextAsync(message.ToPhone, message.Body, cancellationToken);
                message.Status = "sent";
                message.SentAt = DateTimeOffset.UtcNow;
                message.Attempts++;
            }
            catch (Exception ex)
            {
                message.Attempts++;
                message.LastError = ex.Message;
                message.NextAttemptAt = DateTimeOffset.UtcNow.AddMinutes(Math.Min(30, message.Attempts * 2));
                if (message.Attempts >= 5)
                {
                    message.Status = "failed";
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}

public interface IMessageOutboxService
{
    Task EnqueueWhatsAppAsync(string phoneE164, string body, CancellationToken cancellationToken = default);
}

public sealed class MessageOutboxService(AppDbContext db) : IMessageOutboxService
{
    public async Task EnqueueWhatsAppAsync(string phoneE164, string body, CancellationToken cancellationToken = default)
    {
        db.MessageOutbox.Add(new Domain.Entities.MessageOutbox
        {
            ToPhone = phoneE164,
            Body = body,
            Channel = "whatsapp",
            Status = "pending"
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
