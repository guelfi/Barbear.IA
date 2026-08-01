using System.Net;
using System.Net.Http.Json;
using Barbear.IA.Application.Auth;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Barbear.IA.IntegrationTests;

public class AuthEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient? _client;
    private readonly bool _dbAvailable;

    public AuthEndpointsTests(WebApplicationFactory<Program> factory)
    {
        try
        {
            _client = factory.CreateClient();
            _dbAvailable = true;
        }
        catch (Exception ex) when (ex.GetBaseException() is System.Net.Sockets.SocketException or Npgsql.NpgsqlException)
        {
            _dbAvailable = false;
            _client = null;
        }
    }

    [Fact]
    public async Task Health_IsAnonymous_AndReturnsSuccess()
    {
        if (!_dbAvailable || _client is null)
        {
            return; // CI sobe Postgres; local sem porta host pula
        }

        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_Returns401_WithoutLeaking()
    {
        if (!_dbAvailable || _client is null)
        {
            return;
        }

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(
            "nobody@example.com",
            "WrongPass1!"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(body);
        Assert.False(body!.Success);
        Assert.Equal("Credenciais inválidas.", body.Error);
    }
}
