using System.Security.Claims;
using Barbear.IA.Infrastructure.Evolution;
using Barbear.IA.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/auth/otp")]
public sealed class OtpController(
    IOtpService otpService,
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration,
    IHostEnvironment environment) : ControllerBase
{
    public sealed record OtpRequest(string Phone, string Purpose);
    public sealed record OtpVerifyRequest(string Phone, string Purpose, string Code);

    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    [HttpPost("request")]
    public async Task<IActionResult> RequestOtp([FromBody] OtpRequest request, CancellationToken cancellationToken)
    {
        var (_, _, devCode) = await otpService.RequestAsync(request.Phone, request.Purpose, cancellationToken);
        var expose = configuration.GetValue("Otp:ExposeSandboxCodeInResponse", environment.IsDevelopment());
        return Ok(new
        {
            success = true,
            message = expose && devCode is not null
                ? "OTP sandbox (Evolution off). Use o código retornado em devCode."
                : "Se o número for válido, enviaremos um código.",
            devCode = expose ? devCode : null
        });
    }

    [Authorize]
    [EnableRateLimiting("auth")]
    [HttpPost("verify")]
    public async Task<IActionResult> Verify([FromBody] OtpVerifyRequest request, CancellationToken cancellationToken)
    {
        var (success, error) = await otpService.VerifyAsync(request.Phone, request.Purpose, request.Code, cancellationToken);
        if (!success)
        {
            return BadRequest(new { success = false, error });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userId, out var id))
        {
            var user = await userManager.FindByIdAsync(id.ToString());
            if (user is not null)
            {
                user.PhoneNumberConfirmed = true;
                await userManager.UpdateAsync(user);
            }
        }

        return Ok(new { success = true });
    }
}
