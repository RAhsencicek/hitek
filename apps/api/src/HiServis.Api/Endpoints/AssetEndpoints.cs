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
            if (tenantContext.TenantId == null)
            {
                return Results.BadRequest(new { error = "Oturumda TenantId zorunludur." });
            }

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

        // Faz 1: Plaka ile Araç Geçmişi, Son İş Emirleri ve Cari Bakiye Sorgulama
        group.MapGet("/lookup", async (string plate, HiServisDbContext db, ITenantContext tenantContext, CancellationToken ct) =>
        {
            if (tenantContext.TenantId == null)
            {
                return Results.BadRequest(new { error = "Oturumda TenantId zorunludur." });
            }

            if (string.IsNullOrWhiteSpace(plate))
            {
                return Results.BadRequest(new { error = "Plaka parametresi zorunludur." });
            }

            var cleanPlate = plate.Trim().ToUpperInvariant().Replace(" ", "");

            var asset = await db.Assets
                .FirstOrDefaultAsync(a => a.TenantId == tenantContext.TenantId.Value &&
                    (a.PrimaryIdentifier == plate.Trim().ToUpperInvariant() || a.PrimaryIdentifier.Replace(" ", "").ToUpper() == cleanPlate), ct);

            if (asset == null)
            {
                return Results.NotFound(new AssetLookupResultDto(
                    Found: false,
                    Asset: null,
                    RecentWorkOrders: new List<WorkOrderSummaryDto>(),
                    TotalOutstandingBalance: 0m,
                    Message: $"'{plate}' plakalı araç sistemde kayıtlı değil."
                ));
            }

            // Retrieve recent work orders for this asset
            var workOrders = await db.WorkOrders
                .Where(w => w.AssetId == asset.Id)
                .OrderByDescending(w => w.CreatedAt)
                .Take(5)
                .Select(w => new WorkOrderSummaryDto(
                    w.Id,
                    w.WorkOrderNumber,
                    w.Status,
                    w.IntakeMeter,
                    w.CustomerComplaint,
                    w.GrandTotal,
                    w.RemainingBalance,
                    w.Priority,
                    w.CreatedAt
                ))
                .ToListAsync(ct);

            var totalBalance = await db.WorkOrders
                .Where(w => w.AssetId == asset.Id)
                .SumAsync(w => w.RemainingBalance, ct);

            var assetDto = new AssetDto(
                asset.Id,
                asset.PrimaryIdentifier,
                asset.SecondaryIdentifier,
                asset.Brand,
                asset.Model,
                asset.ModelYear,
                asset.CurrentMeter
            );

            return Results.Ok(new AssetLookupResultDto(
                Found: true,
                Asset: assetDto,
                RecentWorkOrders: workOrders,
                TotalOutstandingBalance: totalBalance,
                Message: "Araç geçmişi başarıyla getirildi."
            ));
        })
        .WithName("LookupAssetByPlate")
        .WithSummary("Plaka ile Araç Geçmişi, Eski İş Emirleri ve Bakiye Sorgulama");
    }
}
