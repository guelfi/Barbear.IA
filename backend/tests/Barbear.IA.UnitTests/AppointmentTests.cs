using Barbear.IA.Domain.Entities;
using Barbear.IA.Domain.Enums;

namespace Barbear.IA.UnitTests;

public class AppointmentTests
{
    [Fact]
    public void Schedule_Confirm_Complete_Works()
    {
        var starts = DateTimeOffset.UtcNow.AddHours(1);
        var appt = Appointment.Schedule(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            starts,
            starts.AddMinutes(30));

        Assert.Equal(AppointmentStatus.Scheduled, appt.Status);
        appt.Confirm();
        appt.Start();
        appt.Complete();
        Assert.Equal(AppointmentStatus.Completed, appt.Status);
    }

    [Fact]
    public void Cancel_FromScheduled_Works()
    {
        var starts = DateTimeOffset.UtcNow.AddHours(1);
        var appt = Appointment.Schedule(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            starts,
            starts.AddMinutes(30));

        appt.Cancel("cliente pediu");
        Assert.Equal(AppointmentStatus.Cancelled, appt.Status);
        Assert.Equal("cliente pediu", appt.CancellationReason);
    }
}
