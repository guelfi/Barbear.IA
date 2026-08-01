using Barbear.IA.Api.Extensions;
using Barbear.IA.Domain.Common;
using Barbear.IA.Domain.Constants;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Barbear.IA.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
[Authorize]
public sealed class UsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    public sealed record CreateUserRequest(
        string Name,
        string Email,
        string Password,
        string Role,
        string Phone,
        Guid? TenantId = null);

    public sealed record UpdateUserRequest(string Name, string Phone, bool? IsActive = null);

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? role,
        [FromQuery] string? search,
        [FromQuery] bool? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var isSa = User.IsSuperAdmin() && User.HasClaim("permission", Permissions.ViewAllUsers);
        var isAdmin = User.HasClaim("permission", Permissions.ViewBarbershopStats);
        if (!isSa && !isAdmin)
        {
            return Forbid();
        }

        var query = userManager.Users.AsNoTracking().AsQueryable();
        if (active.HasValue)
        {
            query = query.Where(u => u.IsActive == active.Value);
        }

        if (!isSa)
        {
            var tenantId = User.GetTenantId();
            if (tenantId is null)
            {
                return Forbid();
            }

            query = query.Where(u => u.TenantId == tenantId && u.Role != UserRole.SuperAdmin);
        }

        if (!string.IsNullOrWhiteSpace(role) && RoleNames.TryFromApi(role, out var parsedRole))
        {
            query = query.Where(u => u.Role == parsedRole);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Email!.ToLower().Contains(term) ||
                u.Name.ToLower().Contains(term));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                role = RoleNames.ToApi(u.Role),
                u.TenantId,
                u.PhoneNumber,
                u.PhoneNumberConfirmed,
                u.IsActive,
                u.CreatedAt,
                u.LastLoginAt
            })
            .ToListAsync(cancellationToken);

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> Stats(CancellationToken cancellationToken)
    {
        if (!User.IsSuperAdmin() && !User.HasClaim("permission", Permissions.ViewBarbershopStats))
        {
            return Forbid();
        }

        var query = userManager.Users.AsNoTracking().AsQueryable();
        if (!User.IsSuperAdmin())
        {
            var tenantId = User.GetTenantId();
            if (tenantId is null)
            {
                return Forbid();
            }

            query = query.Where(u => u.TenantId == tenantId);
        }

        return Ok(new
        {
            total = await query.CountAsync(cancellationToken),
            active = await query.CountAsync(u => u.IsActive, cancellationToken),
            inactive = await query.CountAsync(u => !u.IsActive, cancellationToken)
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (!RoleNames.TryFromApi(request.Role, out var role))
        {
            return BadRequest(new { error = "Role inválida." });
        }

        if (role == UserRole.SuperAdmin && !User.IsSuperAdmin())
        {
            return Forbid();
        }

        if (!User.IsSuperAdmin() && !User.HasClaim("permission", Permissions.ManageBarbers))
        {
            return Forbid();
        }

        if (role is UserRole.SuperAdmin && !User.HasClaim("permission", Permissions.ManageUsers))
        {
            return Forbid();
        }

        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (phone is null)
        {
            return BadRequest(new { error = "Telefone inválido." });
        }

        Guid? tenantId = User.IsSuperAdmin() ? request.TenantId : User.GetTenantId();
        if (role != UserRole.SuperAdmin && tenantId is null)
        {
            return BadRequest(new { error = "Tenant obrigatório." });
        }

        if (await userManager.FindByEmailAsync(request.Email.Trim()) is not null)
        {
            return Conflict(new { error = "E-mail já cadastrado." });
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email.Trim().ToLowerInvariant(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Name = request.Name.Trim(),
            Role = role,
            TenantId = tenantId,
            PhoneNumber = phone,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { error = "Não foi possível criar o usuário." });
        }

        await userManager.AddToRoleAsync(user, RoleNames.ToApi(role));
        return CreatedAtAction(nameof(List), new { id = user.Id }, new { user.Id });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null || !CanManage(user))
        {
            return NotFound();
        }

        var phone = PhoneNormalizer.ToE164Br(request.Phone);
        if (phone is null)
        {
            return BadRequest(new { error = "Telefone inválido." });
        }

        user.Name = request.Name.Trim();
        user.PhoneNumber = phone;
        if (request.IsActive.HasValue)
        {
            user.IsActive = request.IsActive.Value;
        }

        await userManager.UpdateAsync(user);
        return Ok(new { user.Id });
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null || !CanManage(user))
        {
            return NotFound();
        }

        user.IsActive = true;
        await userManager.UpdateAsync(user);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var user = await userManager.FindByIdAsync(id.ToString());
        if (user is null || !CanManage(user))
        {
            return NotFound();
        }

        if (!User.IsSuperAdmin() && user.Role is UserRole.SuperAdmin or UserRole.Admin)
        {
            return NotFound();
        }

        user.IsActive = false;
        await userManager.UpdateAsync(user);
        return NoContent();
    }

    private bool CanManage(ApplicationUser user)
    {
        if (User.IsSuperAdmin() && User.HasClaim("permission", Permissions.ManageUsers))
        {
            return true;
        }

        return User.HasClaim("permission", Permissions.ManageBarbers)
               && user.TenantId == User.GetTenantId()
               && user.Role != UserRole.SuperAdmin;
    }
}
