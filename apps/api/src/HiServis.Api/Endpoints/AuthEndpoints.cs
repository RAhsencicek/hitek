using HiServis.Core.DTOs;
using HiServis.Core.Interfaces;

namespace HiServis.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Authentication");

        group.MapPost("/pin-login", async (PinLoginRequest request, IPinAuthService authService, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(request.Phone) || string.IsNullOrWhiteSpace(request.Pin))
            {
                return Results.BadRequest(new { error = "Telefon numarası ve 4 haneli PIN zorunludur." });
            }

            var result = await authService.LoginWithPinAsync(request, ct);
            if (!result.Success)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(result);
        })
        .WithName("PinLogin")
        .WithSummary("Teknisyen ve Atölye Personeli için Hızlı 4 Haneli PIN ile Giriş");
    }
}
