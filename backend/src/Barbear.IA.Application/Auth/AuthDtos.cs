namespace Barbear.IA.Application.Auth;

public sealed record LoginRequest(string Email, string Password, string? UserType = null);

public sealed record RegisterBarbershopRequest(
    string Name,
    string Email,
    string Password,
    string Phone,
    string BarbershopName,
    string? Address = null);

public sealed record RegisterClientRequest(
    string Name,
    string Email,
    string Password,
    string Phone,
    Guid? TenantId = null);

public sealed record RefreshRequest(string RefreshToken);

public sealed record AuthUserDto(
    Guid Id,
    string Name,
    string Email,
    string Role,
    Guid? TenantId,
    string? Phone,
    bool PhoneConfirmed,
    bool IsActive,
    string? AvatarUrl,
    Guid? BarberProfileId,
    Guid? ClientProfileId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastLoginAt);

public sealed record AuthResponse(
    bool Success,
    AuthUserDto? User = null,
    string? AccessToken = null,
    string? RefreshToken = null,
    IReadOnlyList<string>? Permissions = null,
    string? Error = null);

public sealed record MeResponse(
    AuthUserDto User,
    IReadOnlyList<string> Permissions);
