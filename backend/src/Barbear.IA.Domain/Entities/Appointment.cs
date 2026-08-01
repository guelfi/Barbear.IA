using Barbear.IA.Domain.Common;
using Barbear.IA.Domain.Enums;

namespace Barbear.IA.Domain.Entities;

public class Appointment : Entity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid BarberId { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid ServiceId { get; private set; }
    public DateTimeOffset StartsAt { get; private set; }
    public DateTimeOffset EndsAt { get; private set; }
    public AppointmentStatus Status { get; private set; } = AppointmentStatus.Scheduled;
    public string? Notes { get; private set; }
    public string? CancellationReason { get; private set; }

    private Appointment()
    {
    }

    public static Appointment Schedule(
        Guid tenantId,
        Guid barberId,
        Guid clientId,
        Guid serviceId,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        string? notes = null)
    {
        if (endsAt <= startsAt)
        {
            throw new ArgumentException("Horário de término deve ser após o início.");
        }

        return new Appointment
        {
            TenantId = tenantId,
            BarberId = barberId,
            ClientId = clientId,
            ServiceId = serviceId,
            StartsAt = startsAt,
            EndsAt = endsAt,
            Notes = notes,
            Status = AppointmentStatus.Scheduled
        };
    }

    public void Confirm() => TransitionTo(AppointmentStatus.Confirmed);
    public void Start() => TransitionTo(AppointmentStatus.InProgress);
    public void Complete() => TransitionTo(AppointmentStatus.Completed);
    public void MarkNoShow() => TransitionTo(AppointmentStatus.NoShow);

    public void Cancel(string? reason)
    {
        if (Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled)
        {
            throw new InvalidOperationException("Agendamento não pode ser cancelado neste status.");
        }

        Status = AppointmentStatus.Cancelled;
        CancellationReason = reason;
        Touch();
    }

    public void Reschedule(DateTimeOffset startsAt, DateTimeOffset endsAt)
    {
        if (Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow)
        {
            throw new InvalidOperationException("Agendamento não pode ser remarcado neste status.");
        }

        if (endsAt <= startsAt)
        {
            throw new ArgumentException("Horário de término deve ser após o início.");
        }

        StartsAt = startsAt;
        EndsAt = endsAt;
        Touch();
    }

    private void TransitionTo(AppointmentStatus next)
    {
        var allowed = Status switch
        {
            AppointmentStatus.Scheduled => next is AppointmentStatus.Confirmed or AppointmentStatus.InProgress or AppointmentStatus.Cancelled or AppointmentStatus.NoShow,
            AppointmentStatus.Confirmed => next is AppointmentStatus.InProgress or AppointmentStatus.Cancelled or AppointmentStatus.NoShow or AppointmentStatus.Completed,
            AppointmentStatus.InProgress => next is AppointmentStatus.Completed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow,
            _ => false
        };

        if (!allowed)
        {
            throw new InvalidOperationException($"Transição {Status} → {next} não permitida.");
        }

        Status = next;
        Touch();
    }
}
