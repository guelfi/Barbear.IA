using Barbear.IA.Domain.Entities;
using Barbear.IA.Domain.Enums;
using Barbear.IA.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Barbear.IA.Infrastructure.Persistence;

/// <summary>
/// Seed demo multi-tenant (versão 2). Idempotente via usuário marcador barbeiro.beta@barbear.ia.
/// Senha padrão das personas demo: Demo@123456
/// </summary>
public static class DemoDataSeeder
{
    public const int SeedVersion = 2;
    public const string DefaultDemoPassword = "Demo@123456";
    public const string CompletenessMarkerEmail = "barbeiro.beta@barbear.ia";
    public const string AlphaTenantEmail = "demo.alpha@barbear.ia";

    public static async Task SeedAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        IConfiguration config,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        if (!config.GetValue("Seed:DemoData", true))
        {
            logger.LogInformation("Seed:DemoData desabilitado.");
            return;
        }

        if (await userManager.FindByEmailAsync(CompletenessMarkerEmail) is not null)
        {
            logger.LogInformation("Seed demo v{Version} já aplicado (marcador {Email}).", SeedVersion, CompletenessMarkerEmail);
            return;
        }

        // v1 incompleta (só Alpha completo): remove dados demo e recria o pacote v2.
        if (await db.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Email == AlphaTenantEmail, cancellationToken))
        {
            logger.LogWarning("Seed demo v1 detectado — recriando pacote v{Version} completo.", SeedVersion);
            await WipeDemoDataAsync(db, userManager, logger, cancellationToken);
        }

        var password = config["Seed:DemoPassword"] ?? DefaultDemoPassword;
        logger.LogInformation("Aplicando seed demo v{Version} (3 tenants completos)...", SeedVersion);

        await SeedTenantPackAsync(db, userManager, password, new TenantSeedSpec(
            Key: "alpha",
            Name: "Barbearia Alpha Demo",
            TenantEmail: AlphaTenantEmail,
            Phone: "+551133334444",
            OwnerName: "Carlos Dono Alpha",
            OwnerEmail: "dono.alpha@barbear.ia",
            OwnerPhone: "+5511988000001",
            Status: TenantSeedStatus.ApprovedTrial,
            TrialDays: 14,
            Address: new { street = "Rua Augusta, 1000", city = "São Paulo", state = "SP" },
            PhoneBase: 88000000), cancellationToken);

        await SeedTenantPackAsync(db, userManager, password, new TenantSeedSpec(
            Key: "beta",
            Name: "Barbearia Beta Demo",
            TenantEmail: "demo.beta@barbear.ia",
            Phone: "+551155556666",
            OwnerName: "Diego Dono Beta",
            OwnerEmail: "dono.beta@barbear.ia",
            OwnerPhone: "+5511988000010",
            Status: TenantSeedStatus.ApprovedTrial,
            TrialDays: 14,
            Address: new { street = "Av. Paulista, 1500", city = "São Paulo", state = "SP" },
            PhoneBase: 88000010), cancellationToken);

        await SeedTenantPackAsync(db, userManager, password, new TenantSeedSpec(
            Key: "gamma",
            Name: "Barbearia Gamma Demo",
            TenantEmail: "demo.gamma@barbear.ia",
            Phone: "+551177778888",
            OwnerName: "Eduardo Dono Gamma",
            OwnerEmail: "dono.gamma@barbear.ia",
            OwnerPhone: "+5511988000020",
            Status: TenantSeedStatus.SuspendedWithHistory,
            TrialDays: 7,
            Address: new { street = "Rua da Consolação, 200", city = "São Paulo", state = "SP" },
            PhoneBase: 88000020), cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Seed demo v{Version} OK. SA admin@barbear.ia | dono/barbeiro/cliente *.{{alpha|beta|gamma}}@barbear.ia | senha {Password}",
            SeedVersion, password);
    }

    private static async Task SeedTenantPackAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        string password,
        TenantSeedSpec spec,
        CancellationToken cancellationToken)
    {
        var owner = await CreateUserAsync(
            userManager, password, spec.OwnerName, spec.OwnerEmail, UserRole.Admin,
            spec.OwnerPhone, null, RoleNames.Admin);

        var tenant = Tenant.CreatePending(
            spec.Name, spec.TenantEmail, spec.Phone, owner.Id,
            address: spec.Address,
            businessHours: new
            {
                mon = new { open = "09:00", close = "19:00" },
                tue = new { open = "09:00", close = "19:00" },
                wed = new { open = "09:00", close = "19:00" },
                thu = new { open = "09:00", close = "19:00" },
                fri = new { open = "09:00", close = "20:00" },
                sat = new { open = "09:00", close = "17:00" },
                sun = (object?)null
            });

        var now = DateTimeOffset.UtcNow;
        TenantSubscription subscription;

        if (spec.Status == TenantSeedStatus.SuspendedWithHistory)
        {
            tenant.Approve();
            subscription = TenantSubscription.CreateTrial(tenant.Id, spec.TrialDays);
            subscription.ApplyStripe(
                "pro-monthly",
                SubscriptionStatus.Suspended,
                $"cus_demo_{spec.Key}",
                $"sub_demo_{spec.Key}",
                now.AddDays(-30),
                now.AddDays(-1),
                cancelAtPeriodEnd: true);
            tenant.AttachSubscription(subscription);
            tenant.Suspend();
        }
        else
        {
            tenant.Approve();
            subscription = TenantSubscription.CreateTrial(tenant.Id, spec.TrialDays);
            tenant.AttachSubscription(subscription);
        }

        db.Tenants.Add(tenant);
        await db.SaveChangesAsync(cancellationToken);

        owner.TenantId = tenant.Id;
        await userManager.UpdateAsync(owner);

        var services = new[]
        {
            ServiceOffering.Create(tenant.Id, "Corte masculino", 60m, 30, "cabelo", "Corte clássico"),
            ServiceOffering.Create(tenant.Id, "Barba completa", 45m, 25, "barba", "Modelagem + toalha quente"),
            ServiceOffering.Create(tenant.Id, "Corte + Barba", 95m, 55, "combo", "Pacote completo"),
            ServiceOffering.Create(tenant.Id, "Sobrancelha", 25m, 15, "estetica", "Design masculino"),
        };
        db.Services.AddRange(services);
        await db.SaveChangesAsync(cancellationToken);

        var barber1User = await CreateUserAsync(
            userManager, password,
            $"Bruno Barbeiro {spec.Key}", $"barbeiro.{spec.Key}@barbear.ia", UserRole.Barber,
            $"+5511{spec.PhoneBase + 2:D8}", tenant.Id, RoleNames.Barber);
        var barber2User = await CreateUserAsync(
            userManager, password,
            $"Pedro Barbeiro {spec.Key}", $"barbeiro2.{spec.Key}@barbear.ia", UserRole.Barber,
            $"+5511{spec.PhoneBase + 3:D8}", tenant.Id, RoleNames.Barber);

        var barber1 = BarberProfile.Create(
            tenant.Id, barber1User.Name, barber1User.Email!, barber1User.PhoneNumber!,
            barber1User.Id, $"Especialista {spec.Key} — fades e barbas.");
        barber1.SetServices(services.Select(s => s.Id));
        var barber2 = BarberProfile.Create(
            tenant.Id, barber2User.Name, barber2User.Email!, barber2User.PhoneNumber!,
            barber2User.Id, $"Especialista {spec.Key} — cortes modernos.");
        barber2.SetServices([services[0].Id, services[2].Id, services[3].Id]);
        db.BarberProfiles.AddRange(barber1, barber2);
        await db.SaveChangesAsync(cancellationToken);

        barber1User.BarberProfileId = barber1.Id;
        barber2User.BarberProfileId = barber2.Id;
        await userManager.UpdateAsync(barber1User);
        await userManager.UpdateAsync(barber2User);

        var client1User = await CreateUserAsync(
            userManager, password,
            $"Ana Cliente {spec.Key}", $"cliente.{spec.Key}@barbear.ia", UserRole.Client,
            $"+5511{spec.PhoneBase + 4:D8}", tenant.Id, RoleNames.Client);
        var client2User = await CreateUserAsync(
            userManager, password,
            $"Lia Cliente {spec.Key}", $"cliente2.{spec.Key}@barbear.ia", UserRole.Client,
            $"+5511{spec.PhoneBase + 5:D8}", tenant.Id, RoleNames.Client);

        var client1 = ClientProfile.Create(
            tenant.Id, client1User.Name, client1User.Email!, client1User.PhoneNumber!,
            client1User.Id, "Prefere horários à tarde.");
        var client2 = ClientProfile.Create(
            tenant.Id, client2User.Name, client2User.Email!, client2User.PhoneNumber!,
            client2User.Id, "Cliente frequente.");
        var walkIn = ClientProfile.Create(
            tenant.Id, $"Walk-in {spec.Key}", $"walkin.{spec.Key}@barbear.ia",
            $"+5511{spec.PhoneBase + 9:D8}", userId: null, notes: "Sem login — criado pelo admin");
        db.ClientProfiles.AddRange(client1, client2, walkIn);
        await db.SaveChangesAsync(cancellationToken);

        client1User.ClientProfileId = client1.Id;
        client2User.ClientProfileId = client2.Id;
        await userManager.UpdateAsync(client1User);
        await userManager.UpdateAsync(client2User);

        var day = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, TimeSpan.Zero);
        var appts = new List<Appointment>
        {
            Appointment.Schedule(tenant.Id, barber1.Id, client1.Id, services[2].Id,
                day.AddHours(14), day.AddHours(14).AddMinutes(55), $"Combo hoje ({spec.Key})"),
            Appointment.Schedule(tenant.Id, barber1.Id, walkIn.Id, services[0].Id,
                day.AddDays(1).AddHours(10), day.AddDays(1).AddHours(10).AddMinutes(30), $"Walk-in amanhã ({spec.Key})"),
            Appointment.Schedule(tenant.Id, barber2.Id, client2.Id, services[1].Id,
                day.AddDays(2).AddHours(16), day.AddDays(2).AddHours(16).AddMinutes(25), $"Barba ({spec.Key})"),
            Appointment.Schedule(tenant.Id, barber2.Id, client1.Id, services[3].Id,
                day.AddDays(-2).AddHours(11), day.AddDays(-2).AddHours(11).AddMinutes(15), $"Histórico ({spec.Key})"),
            Appointment.Schedule(tenant.Id, barber1.Id, client2.Id, services[0].Id,
                day.AddDays(-5).AddHours(15), day.AddDays(-5).AddHours(15).AddMinutes(30), $"Concluído ({spec.Key})"),
        };
        appts[3].Confirm();
        appts[3].Complete();
        appts[4].Confirm();
        appts[4].Complete();
        appts[0].Confirm();
        db.Appointments.AddRange(appts);

        db.Notifications.AddRange(
            Notification.Create(tenant.Id, owner.Id, "system", $"Bem-vindo — {spec.Name}",
                spec.Status == TenantSeedStatus.SuspendedWithHistory
                    ? "Tenant suspenso (demo). Mutações devem ser bloqueadas."
                    : "Tenant demo aprovado com trial. Billing em sandbox local."),
            Notification.Create(tenant.Id, barber1User.Id, "appointment", "Agenda do dia",
                "Você tem agendamentos demo para validar a persona barbeiro."),
            Notification.Create(tenant.Id, barber2User.Id, "appointment", "Novos horários",
                "Confira a agenda da semana no painel."),
            Notification.Create(tenant.Id, client1User.Id, "appointment", "Seu horário",
                "Agendamento demo criado para hoje às 14h."),
            Notification.Create(tenant.Id, client2User.Id, "system", "Preferências",
                "Notificações WhatsApp ativas nas preferências do perfil."));

        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task WipeDemoDataAsync(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var demoEmails = new[]
        {
            AlphaTenantEmail, "demo.beta@barbear.ia", "demo.gamma@barbear.ia"
        };

        var tenants = await db.Tenants.IgnoreQueryFilters()
            .Include(t => t.Subscription)
            .Where(t => demoEmails.Contains(t.Email))
            .ToListAsync(cancellationToken);

        var tenantIds = tenants.Select(t => t.Id).ToList();
        if (tenantIds.Count == 0)
        {
            return;
        }

        db.Appointments.RemoveRange(await db.Appointments.IgnoreQueryFilters()
            .Where(x => tenantIds.Contains(x.TenantId)).ToListAsync(cancellationToken));
        db.Notifications.RemoveRange(await db.Notifications.IgnoreQueryFilters()
            .Where(x => tenantIds.Contains(x.TenantId)).ToListAsync(cancellationToken));
        db.BarberProfiles.RemoveRange(await db.BarberProfiles.IgnoreQueryFilters()
            .Where(x => tenantIds.Contains(x.TenantId)).ToListAsync(cancellationToken));
        db.ClientProfiles.RemoveRange(await db.ClientProfiles.IgnoreQueryFilters()
            .Where(x => tenantIds.Contains(x.TenantId)).ToListAsync(cancellationToken));
        db.Services.RemoveRange(await db.Services.IgnoreQueryFilters()
            .Where(x => tenantIds.Contains(x.TenantId)).ToListAsync(cancellationToken));

        foreach (var t in tenants)
        {
            if (t.Subscription is not null)
            {
                db.Set<TenantSubscription>().Remove(t.Subscription);
            }
        }

        db.Tenants.RemoveRange(tenants);
        await db.SaveChangesAsync(cancellationToken);

        var demoUserEmails = new[]
        {
            "dono.alpha@barbear.ia", "barbeiro.alpha@barbear.ia", "barbeiro2.alpha@barbear.ia",
            "cliente.alpha@barbear.ia", "cliente2.alpha@barbear.ia",
            "dono.beta@barbear.ia", "barbeiro.beta@barbear.ia", "barbeiro2.beta@barbear.ia",
            "cliente.beta@barbear.ia", "cliente2.beta@barbear.ia",
            "dono.gamma@barbear.ia", "barbeiro.gamma@barbear.ia", "barbeiro2.gamma@barbear.ia",
            "cliente.gamma@barbear.ia", "cliente2.gamma@barbear.ia",
        };

        foreach (var email in demoUserEmails)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user is not null)
            {
                await userManager.DeleteAsync(user);
            }
        }

        logger.LogInformation("Dados demo v1 removidos ({Count} tenants).", tenantIds.Count);
    }

    private static async Task<ApplicationUser> CreateUserAsync(
        UserManager<ApplicationUser> userManager,
        string password,
        string name,
        string email,
        UserRole role,
        string phone,
        Guid? tenantId,
        string roleName)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            return existing;
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            Name = name,
            Role = role,
            TenantId = tenantId,
            PhoneNumber = phone,
            PhoneNumberConfirmed = true,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Falha seed user {email}: {string.Join("; ", result.Errors.Select(e => e.Description))}");
        }

        await userManager.AddToRoleAsync(user, roleName);
        return user;
    }

    private enum TenantSeedStatus
    {
        ApprovedTrial,
        SuspendedWithHistory
    }

    private sealed record TenantSeedSpec(
        string Key,
        string Name,
        string TenantEmail,
        string Phone,
        string OwnerName,
        string OwnerEmail,
        string OwnerPhone,
        TenantSeedStatus Status,
        int TrialDays,
        object Address,
        int PhoneBase);
}
