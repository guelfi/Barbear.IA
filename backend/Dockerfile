FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props ./
COPY Barbear.IA.slnx ./
COPY src/Barbear.IA.Domain/Barbear.IA.Domain.csproj src/Barbear.IA.Domain/
COPY src/Barbear.IA.Application/Barbear.IA.Application.csproj src/Barbear.IA.Application/
COPY src/Barbear.IA.Infrastructure/Barbear.IA.Infrastructure.csproj src/Barbear.IA.Infrastructure/
COPY src/Barbear.IA.Api/Barbear.IA.Api.csproj src/Barbear.IA.Api/
RUN dotnet restore src/Barbear.IA.Api/Barbear.IA.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/Barbear.IA.Api/Barbear.IA.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
  CMD curl -fsS http://127.0.0.1:8080/health || exit 1
ENTRYPOINT ["dotnet", "Barbear.IA.Api.dll"]

