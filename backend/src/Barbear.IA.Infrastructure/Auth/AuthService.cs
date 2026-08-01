using Barbear.IA.Application.Auth;
using Barbear.IA.Domain.Common;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Entities;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Identity;
using Barbear.IA.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Barbear.IA.Infrastructure.Auth;

public sealed class AuthService(
    UserManager<ApplicationUser> userManager,
    AppDbContext db,
    ITokenService tokenService,
    IOptions<JwtOptions> jwtOptions) : IAuthService
{
    private const string GenericLoginError = "Credenciais inválidas.";
    private const string GenericRegisterError = "Não foi possível concluir o cadastro.";

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Fail(GenericLoginError);
        }

        var user = await userManager.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);
        if (user is null || !user.IsActive)
        {
            return Fail(GenericLoginError);
        }

        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            return Fail(GenericLoginError);
        }

        if (!string.IsNullOrWhiteSpace(request.UserType) &&
            RoleNames.TryFromApi(request.UserType, out var expected) &&
            user.Role != expected)
        {
            return Fail(GenericLoginError);
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        await userManager.UpdateAsync(user);

        return await IssueAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RegisterBarbershopAsync(
        RegisterBarbershopRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.BarbershopName) ||
            phone is null)
        {
            return Fail("Dados de cadastro inválidos.");
        }

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return Fail(GenericRegisterError);
        }

        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            Name = request.Name.Trim(),
            Role = UserRole.Admin,
            PhoneNumber = phone,
            PhoneNumberConfirmed = false,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Fail(GenericRegisterError);
        }

        await userManager.AddToRoleAsync(user, RoleNames.Admin);

        var tenant = Tenant.CreatePending(
            request.BarbershopName,
            email,
            phone,
            user.Id,
            address: string.IsNullOrWhiteSpace(request.Address) ? null : new { line = request.Address });

        var subscription = TenantSubscription.CreateTrial(tenant.Id);
        tenant.AttachSubscription(subscription);

        db.Tenants.Add(tenant);
        await db.SaveChangesAsync(cancellationToken);

        user.TenantId = tenant.Id;
        await userManager.UpdateAsync(user);
        await tx.CommitAsync(cancellationToken);

        return await IssueAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RegisterClientAsync(
        RegisterClientRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = NormalizeEmail(request.Email);
        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            phone is null)
        {
            return Fail("Dados de cadastro inválidos.");
        }

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return Fail(GenericRegisterError);
        }

        if (request.TenantId.HasValue)
        {
            var tenantOk = await db.Tenants.AsNoTracking()
                .AnyAsync(t => t.Id == request.TenantId && t.Status == TenantStatus.Approved && t.IsActive, cancellationToken);
            if (!tenantOk)
            {
                return Fail("Barbearia inválida ou indisponível.");
            }
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            Name = request.Name.Trim(),
            Role = UserRole.Client,
            TenantId = request.TenantId,
            PhoneNumber = phone,
            PhoneNumberConfirmed = false,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var createResult = await userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Fail(GenericRegisterError);
        }

        await userManager.AddToRoleAsync(user, RoleNames.Client);
        return await IssueAsync(user, cancellationToken);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Fail("Sessão inválida.");
        }

        var hash = tokenService.HashToken(request.RefreshToken);
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == hash, cancellationToken);
        if (stored is null || !stored.IsActive)
        {
            return Fail("Sessão inválida.");
        }

        var user = await userManager.FindByIdAsync(stored.UserId.ToString());
        if (user is null || !user.IsActive)
        {
            return Fail("Sessão inválida.");
        }

        var newRefresh = tokenService.CreateRefreshToken();
        var newHash = tokenService.HashToken(newRefresh);
        stored.Revoke(newHash);

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = newHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays)
        });
        await db.SaveChangesAsync(cancellationToken);

        var permissions = PermissionsFor(user.Role);
        var access = tokenService.CreateAccessToken(user, permissions);
        return new AuthResponse(true, MapUser(user), access, newRefresh, permissions);
    }

    public async Task LogoutAsync(Guid userId, string? refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            var active = await db.RefreshTokens
                .Where(x => x.UserId == userId && x.RevokedAt == null)
                .ToListAsync(cancellationToken);
            foreach (var token in active)
            {
                token.Revoke();
            }

            await db.SaveChangesAsync(cancellationToken);
            return;
        }

        var hash = tokenService.HashToken(refreshToken);
        var stored = await db.RefreshTokens.FirstOrDefaultAsync(
            x => x.UserId == userId && x.TokenHash == hash,
            cancellationToken);
        if (stored is not null && stored.IsActive)
        {
            stored.Revoke();
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<MeResponse?> GetMeAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null || !user.IsActive)
        {
            return null;
        }

        return new MeResponse(MapUser(user), PermissionsFor(user.Role));
    }

    private async Task<AuthResponse> IssueAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var permissions = PermissionsFor(user.Role);
        var access = tokenService.CreateAccessToken(user, permissions);
        var refresh = tokenService.CreateRefreshToken();

        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = tokenService.HashToken(refresh),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays)
        });
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResponse(true, MapUser(user), access, refresh, permissions);
    }

    private static IReadOnlyList<string> PermissionsFor(UserRole role) => role switch
    {
        UserRole.SuperAdmin => Permissions.ForSuperAdmin,
        UserRole.Admin => Permissions.ForAdmin,
        UserRole.Barber => Permissions.ForBarber,
        UserRole.Client => Permissions.ForClient,
        _ => []
    };

    private static AuthUserDto MapUser(ApplicationUser user) => new(
        user.Id,
        user.Name,
        user.Email ?? string.Empty,
        RoleNames.ToApi(user.Role),
        user.TenantId,
        user.PhoneNumber,
        user.PhoneNumberConfirmed,
        user.IsActive,
        user.AvatarUrl,
        user.BarberProfileId,
        user.ClientProfileId,
        user.CreatedAt,
        user.LastLoginAt);

    private static AuthResponse Fail(string error) => new(false, Error: error);

    private static string NormalizeEmail(string? email) =>
        (email ?? string.Empty).Trim().ToLowerInvariant();
}
