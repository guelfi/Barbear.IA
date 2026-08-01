namespace Barbear.IA.Domain.Enums;

public static class RoleNames
{
    public const string SuperAdmin = "super_admin";
    public const string Admin = "admin";
    public const string Barber = "barber";
    public const string Client = "client";
    public const string BarbershopAlias = "barbershop";

    public static string ToApi(UserRole role) => role switch
    {
        UserRole.SuperAdmin => SuperAdmin,
        UserRole.Admin => Admin,
        UserRole.Barber => Barber,
        UserRole.Client => Client,
        _ => throw new ArgumentOutOfRangeException(nameof(role), role, null)
    };

    public static UserRole FromApi(string? value)
    {
        return (value?.Trim().ToLowerInvariant()) switch
        {
            SuperAdmin => UserRole.SuperAdmin,
            Admin or BarbershopAlias => UserRole.Admin,
            Barber => UserRole.Barber,
            Client => UserRole.Client,
            _ => throw new ArgumentException("Role inválida.", nameof(value))
        };
    }

    public static bool TryFromApi(string? value, out UserRole role)
    {
        try
        {
            role = FromApi(value);
            return true;
        }
        catch
        {
            role = default;
            return false;
        }
    }
}
