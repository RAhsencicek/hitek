using HiServis.Core.DTOs;
using HiServis.Core.Interfaces;

namespace HiServis.Api.Endpoints;

public static class OcrEndpoints
{
    public static void MapOcrEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/ocr").WithTags("OCR & TSB Catalog");

        // Parse vehicle registration card (Ruhsat OCR) and enrich with TSB Catalog
        group.MapPost("/registration-card", async (RegistrationCardOcrRequest request, IRegistrationCardOcrService ocrService, CancellationToken ct) =>
        {
            var result = await ocrService.ProcessRegistrationCardAsync(request, ct);
            return Results.Ok(result);
        })
        .WithName("ProcessRegistrationCardOcr")
        .WithSummary("Ruhsat OCR Ayrıştırma ve TSB Kasko Kataloğu ile Otomatik Doldurma");

        // Search TSB vehicle catalog
        group.MapGet("/tsb-catalog/search", (string? query, ITsbVehicleCatalogService tsbService) =>
        {
            var results = tsbService.SearchVehicles(query ?? string.Empty);
            return Results.Ok(results);
        })
        .WithName("SearchTsbCatalog")
        .WithSummary("TSB Kasko Araç Kataloğu Arama");
    }
}
