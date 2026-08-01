using System.Security.Claims;
using Barbear.IA.Infrastructure.Identity;

namespace Barbear.IA.Infrastructure.Auth;

public interface ITokenService
{
    string CreateAccessToken(ApplicationUser user, IEnumerable<string> permissions);
    string CreateRefreshToken();
    string HashToken(string token);
    ClaimsPrincipal? ValidateExpiredAccessToken(string token);
}
