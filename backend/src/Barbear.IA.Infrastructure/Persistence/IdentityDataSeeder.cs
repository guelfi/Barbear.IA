using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Barbear.IA.Infrastructure.Persistence;

public static class IdentityDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("IdentityDataSeeder");
        var db = sp.GetRequiredService<AppDbContext>();
        var roleManager = sp.GetRequiredService<RoleManager<ApplicationRole>>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var config = sp.GetRequiredService<IConfiguration>();

        await db.Database.MigrateAsync(cancellationToken);

        foreach (var roleName in new[] { RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Barber, RoleNames.Client })
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new ApplicationRole(roleName) { Id = Guid.NewGuid() });
            }
        }

        var email = config["Seed:SuperAdmin:Email"] ?? "admin@barbear.ia";
        var password = config["Seed:SuperAdmin:Password"] ?? "Admin123#";
        var name = config["Seed:SuperAdmin:Name"] ?? "Super Admin";

        var existingAdmin = await userManager.FindByEmailAsync(email);
        if (existingAdmin is null)
        {
            var user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                Name = name,
                Role = UserRole.SuperAdmin,
                PhoneNumber = "+5500000000000",
                PhoneNumberConfirmed = true,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            var result = await userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                logger.LogError("Falha ao criar Super Admin seed: {Errors}",
                    string.Join("; ", result.Errors.Select(e => e.Description)));
            }
            else
            {
                await userManager.AddToRoleAsync(user, RoleNames.SuperAdmin);
                logger.LogInformation("Super Admin seed criado: {Email}", email);
            }
        }
        else
        {
            var resetToken = await userManager.GeneratePasswordResetTokenAsync(existingAdmin);
            var resetResult = await userManager.ResetPasswordAsync(existingAdmin, resetToken, password);
            if (!resetResult.Succeeded)
            {
                logger.LogError("Falha ao sincronizar senha do Super Admin: {Errors}",
                    string.Join("; ", resetResult.Errors.Select(e => e.Description)));
            }
            else
            {
                logger.LogInformation("Senha do Super Admin sincronizada a partir do seed: {Email}", email);
            }
        }

        await DemoDataSeeder.SeedAsync(db, userManager, config, logger, cancellationToken);
    }
}
