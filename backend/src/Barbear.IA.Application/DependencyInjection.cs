using Barbear.IA.Application.Common;
using Microsoft.Extensions.DependencyInjection;

namespace Barbear.IA.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
        return services;
    }
}
