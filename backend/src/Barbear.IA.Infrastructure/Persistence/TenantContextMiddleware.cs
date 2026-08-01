using System.Security.Claims;
using Barbear.IA.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace Barbear.IA.Infrastructure.Persistence;

public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TenantContext tenantContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var role = context.User.FindFirstValue("role")
                       ?? context.User.FindFirstValue(ClaimTypes.Role);
            tenantContext.IsSuperAdmin = string.Equals(role, RoleNames.SuperAdmin, StringComparison.Ordinal);

            var tenantClaim = context.User.FindFirstValue("tenant_id");
            if (Guid.TryParse(tenantClaim, out var tenantId))
            {
                // SA opera sem filtro global; demais roles ficam presas ao tenant do token.
                tenantContext.TenantId = tenantContext.IsSuperAdmin ? null : tenantId;
            }
            else if (!tenantContext.IsSuperAdmin)
            {
                tenantContext.TenantId = null;
            }
        }

        await next(context);
    }
}
