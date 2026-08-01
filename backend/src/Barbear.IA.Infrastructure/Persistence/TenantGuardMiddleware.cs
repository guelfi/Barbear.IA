using Barbear.IA.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Infrastructure.Persistence;

/// <summary>
/// Bloqueia mutações (POST/PUT/PATCH/DELETE) quando o tenant do token está suspended/cancelled.
/// SA e rotas de auth/billing/webhooks ficam liberadas.
/// </summary>
public sealed class TenantGuardMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> MutationMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Post, HttpMethods.Put, HttpMethods.Patch, HttpMethods.Delete
    };

    public async Task InvokeAsync(HttpContext context, AppDbContext db, TenantContext tenantContext)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        var isMutation = MutationMethods.Contains(context.Request.Method);
        var bypass =
            tenantContext.IsSuperAdmin ||
            path.StartsWith("/api/v1/auth", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/api/v1/webhooks", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/api/v1/billing", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/health", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase);

        if (isMutation && !bypass && tenantContext.TenantId is Guid tenantId)
        {
            var status = await db.Tenants.AsNoTracking()
                .Where(t => t.Id == tenantId)
                .Select(t => (TenantStatus?)t.Status)
                .FirstOrDefaultAsync(context.RequestAborted);

            if (status is TenantStatus.Suspended or TenantStatus.Cancelled)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Barbearia suspensa ou cancelada. Operações bloqueadas."
                });
                return;
            }
        }

        await next(context);
    }
}
