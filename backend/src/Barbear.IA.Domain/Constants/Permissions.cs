namespace Barbear.IA.Domain.Constants;

/// <summary>
/// Catálogo formal de permissions (docs/criterios-aceite-e-rbac.md).
/// </summary>
public static class Permissions
{
    public const string ViewAllBarbershops = "view_all_barbershops";
    public const string ManageBarbershops = "manage_barbershops";
    public const string ViewAllUsers = "view_all_users";
    public const string ManageUsers = "manage_users";
    public const string ViewGlobalStats = "view_global_stats";
    public const string ManageSubscriptions = "manage_subscriptions";
    public const string ViewBilling = "view_billing";
    public const string ManageSystemSettings = "manage_system_settings";
    public const string ViewMessagingStatus = "view_messaging_status";

    public const string ViewBarbershopStats = "view_barbershop_stats";
    public const string ManageBarbershopSettings = "manage_barbershop_settings";
    public const string ViewBarbers = "view_barbers";
    public const string ManageBarbers = "manage_barbers";
    public const string ViewClients = "view_clients";
    public const string ManageClients = "manage_clients";
    public const string ViewServices = "view_services";
    public const string ManageServices = "manage_services";
    public const string ViewAppointments = "view_appointments";
    public const string ManageAppointments = "manage_appointments";
    public const string ManageWhatsappSettings = "manage_whatsapp_settings";

    public const string ViewOwnStats = "view_own_stats";
    public const string ViewOwnAppointments = "view_own_appointments";
    public const string ManageOwnAppointments = "manage_own_appointments";
    public const string ViewAssignedClients = "view_assigned_clients";
    public const string UpdateOwnProfile = "update_own_profile";

    public const string CreateAppointments = "create_appointments";
    public const string CancelOwnAppointments = "cancel_own_appointments";

    public static IReadOnlyList<string> ForSuperAdmin { get; } =
    [
        ViewAllBarbershops,
        ManageBarbershops,
        ViewAllUsers,
        ManageUsers,
        ViewGlobalStats,
        ManageSubscriptions,
        ViewBilling,
        ManageSystemSettings,
        ViewMessagingStatus,
        ViewServices
    ];

    public static IReadOnlyList<string> ForAdmin { get; } =
    [
        ViewBarbershopStats,
        ManageBarbershopSettings,
        ViewBarbers,
        ManageBarbers,
        ViewClients,
        ManageClients,
        ViewServices,
        ManageServices,
        ViewAppointments,
        ManageAppointments,
        ManageWhatsappSettings
    ];

    public static IReadOnlyList<string> ForBarber { get; } =
    [
        ViewOwnStats,
        ViewOwnAppointments,
        ManageOwnAppointments,
        ViewAssignedClients,
        ViewServices,
        UpdateOwnProfile
    ];

    public static IReadOnlyList<string> ForClient { get; } =
    [
        ViewOwnAppointments,
        CreateAppointments,
        CancelOwnAppointments,
        ViewBarbers,
        ViewServices,
        UpdateOwnProfile
    ];

    public static IReadOnlyList<string> All { get; } =
        ForSuperAdmin
            .Concat(ForAdmin)
            .Concat(ForBarber)
            .Concat(ForClient)
            .Distinct(StringComparer.Ordinal)
            .ToArray();
}
