using Barbear.IA.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Barbear.IA.Infrastructure.Persistence.Configurations;

public sealed class BarberProfileConfiguration : IEntityTypeConfiguration<BarberProfile>
{
    public void Configure(EntityTypeBuilder<BarberProfile> builder)
    {
        builder.ToTable("barber_profiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Bio).HasMaxLength(2000);
        builder.Property(x => x.AvatarUrl).HasMaxLength(500);
        builder.Property(x => x.ServiceIdsJson).HasColumnType("jsonb");
        builder.Property(x => x.WorkingHoursJson).HasColumnType("jsonb");
        builder.HasIndex(x => new { x.TenantId, x.Email });
        builder.HasIndex(x => x.UserId);
    }
}

public sealed class ClientProfileConfiguration : IEntityTypeConfiguration<ClientProfile>
{
    public void Configure(EntityTypeBuilder<ClientProfile> builder)
    {
        builder.ToTable("client_profiles");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Email).HasMaxLength(256).IsRequired();
        builder.Property(x => x.Phone).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(4000);
        builder.Property(x => x.PreferencesJson).HasColumnType("jsonb");
        builder.HasIndex(x => new { x.TenantId, x.Email });
        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => new { x.TenantId, x.Phone });
    }
}

public sealed class ServiceOfferingConfiguration : IEntityTypeConfiguration<ServiceOffering>
{
    public void Configure(EntityTypeBuilder<ServiceOffering> builder)
    {
        builder.ToTable("services");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.Category).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Price).HasPrecision(12, 2);
        builder.HasIndex(x => new { x.TenantId, x.Name });
        builder.HasIndex(x => new { x.TenantId, x.Category });
    }
}

public sealed class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.ToTable("appointments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(32);
        builder.Property(x => x.Notes).HasMaxLength(2000);
        builder.Property(x => x.CancellationReason).HasMaxLength(1000);
        builder.HasIndex(x => new { x.TenantId, x.StartsAt });
        builder.HasIndex(x => new { x.TenantId, x.BarberId, x.StartsAt });
        builder.HasIndex(x => new { x.TenantId, x.ClientId, x.StartsAt });
        builder.HasIndex(x => new { x.TenantId, x.Status });
    }
}

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Type).HasMaxLength(64).IsRequired();
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Message).HasMaxLength(4000).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.UserId, x.IsRead });
    }
}

public sealed class MessageOutboxConfiguration : IEntityTypeConfiguration<MessageOutbox>
{
    public void Configure(EntityTypeBuilder<MessageOutbox> builder)
    {
        builder.ToTable("message_outbox");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Channel).HasMaxLength(32).IsRequired();
        builder.Property(x => x.ToPhone).HasMaxLength(32).IsRequired();
        builder.Property(x => x.Body).HasMaxLength(4000).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(32).IsRequired();
        builder.Property(x => x.LastError).HasMaxLength(2000);
        builder.HasIndex(x => new { x.Status, x.NextAttemptAt });
    }
}

