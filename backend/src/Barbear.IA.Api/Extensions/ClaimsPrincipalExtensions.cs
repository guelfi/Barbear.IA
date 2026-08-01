using System.Security.Claims;
using Barbear.IA.Domain.Enums;

namespace Barbear.IA.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    public static Guid? GetTenantId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue("tenant_id");
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    public static Guid? GetBarberId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue("barber_id");
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    public static Guid? GetClientId(this ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue("client_id");
        return Guid.TryParse(raw, out var id) ? id : null;
    }

    public static bool IsSuperAdmin(this ClaimsPrincipal user)
    {
        var role = user.FindFirstValue("role") ?? user.FindFirstValue(ClaimTypes.Role);
        return string.Equals(role, RoleNames.SuperAdmin, StringComparison.Ordinal);
    }
}
