using System.Security.Claims;
using Barbear.IA.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("register/barbershop")]
    public async Task<ActionResult<AuthResponse>> RegisterBarbershop(
        [FromBody] RegisterBarbershopRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterBarbershopAsync(request, cancellationToken);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("register/client")]
    public async Task<ActionResult<AuthResponse>> RegisterClient(
        [FromBody] RegisterClientRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RegisterClientAsync(request, cancellationToken);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(
        [FromBody] RefreshRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(request, cancellationToken);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] RefreshRequest? request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        await authService.LogoutAsync(userId.Value, request?.RefreshToken, cancellationToken);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var me = await authService.GetMeAsync(userId.Value, cancellationToken);
        return me is null ? Unauthorized() : Ok(me);
    }

    private Guid? GetUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return Guid.TryParse(raw, out var id) ? id : null;
    }
}
