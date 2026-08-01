namespace Barbear.IA.Application.Auth;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RegisterBarbershopAsync(RegisterBarbershopRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RegisterClientAsync(RegisterClientRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);
    Task LogoutAsync(Guid userId, string? refreshToken, CancellationToken cancellationToken = default);
    Task<MeResponse?> GetMeAsync(Guid userId, CancellationToken cancellationToken = default);
}
