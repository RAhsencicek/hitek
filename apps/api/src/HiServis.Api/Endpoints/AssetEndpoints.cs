using HiServis.Core.DTOs;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Api.Endpoints;

public static class AssetEndpoints
{
    public static void MapAssetEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/assets").WithTags("Assets");

        group.MapGet("/search", async (string query, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return Results.BadRequest(new { error = "Arama terimi (plaka veya şase) zorunludur." });
            }

            var cleanQuery = query.Trim().ToUpperInvariant().Replace(" ", "");

            var assets = await db.Assets
                .Where(a => a.PrimaryIdentifier.Replace(" ", "").Contains(cleanQuery) ||
                            (a.SecondaryIdentifier != null && a.SecondaryIdentifier.Contains(cleanQuery)))
                .Take(10)
                .Select(a => new AssetDto(
                    a.Id,
                    a.PrimaryIdentifier,
                    a.SecondaryIdentifier,
                    a.Brand,
                    a.Model,
                    a.ModelYear,
                    a.CurrentMeter
                ))
                .ToListAsync(ct);

            return Results.Ok(assets);
        })
        .WithName("SearchAssets")
        .WithSummary("Plaka veya Şase Numarası ile Hızlı Araç Arama");
    }
}
