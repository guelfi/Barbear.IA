using Barbear.IA.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace Barbear.IA.Infrastructure.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? BarberProfileId { get; set; }
    public Guid? ClientProfileId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastLoginAt { get; set; }
    public string? AvatarUrl { get; set; }
}

public class ApplicationRole : IdentityRole<Guid>
{
    public ApplicationRole()
    {
    }

    public ApplicationRole(string roleName) : base(roleName)
    {
    }
}
