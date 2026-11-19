using HiServis.Core.DTOs;
using HiServis.Core.Interfaces;

namespace HiServis.Infrastructure.Services;

public class TsbVehicleCatalogService : ITsbVehicleCatalogService
{
    private static readonly List<TsbVehicleDto> Catalog = new()
    {
        new TsbVehicleDto("1531245", "Passat 1.6 TDI BMT Comfortline DSG", 1598, 120, "Diesel", "Automatic"),
        new TsbVehicleDto("1531246", "Passat 1.5 TSI ACT Elegance DSG", 1498, 150, "Gas", "Automatic"),
        new TsbVehicleDto("1531102", "Golf 1.5 eTSI Life DSG", 1498, 150, "Hybrid", "Automatic"),
        new TsbVehicleDto("1042301", "Megane 1.5 Blue dCi Icon EDC", 1461, 115, "Diesel", "Automatic"),
        new TsbVehicleDto("1042250", "Clio 1.0 TCe Touch X-Tronic", 999, 90, "Gas", "Automatic"),
        new TsbVehicleDto("2081190", "Corolla 1.8 Hybrid Dream e-CVT", 1798, 140, "Hybrid", "Automatic"),
        new TsbVehicleDto("3015401", "Egea 1.4 Fire Easy Manuel", 1368, 95, "Gas", "Manual"),
        new TsbVehicleDto("3015420", "Egea 1.6 Multijet Lounge DCT", 1598, 130, "Diesel", "Automatic"),
        new TsbVehicleDto("4021105", "Focus 1.5 EcoBlue Trend X Otomatik", 1499, 120, "Diesel", "Automatic"),
        new TsbVehicleDto("5032204", "Civic 1.5 VTEC Turbo Elegance CVT", 1498, 182, "Gas", "Automatic"),
        new TsbVehicleDto("6041300", "Tucson 1.6 CRDi Elite Plus 4x4 DCT", 1598, 136, "Diesel", "Automatic"),
        new TsbVehicleDto("7051400", "320i Sedan M Sport 8-Steptronic", 1998, 170, "Gas", "Automatic"),
        new TsbVehicleDto("8061500", "C 200 4MATIC AMG 9G-Tronic", 1496, 204, "Mild Hybrid", "Automatic")
    };

    private static readonly Dictionary<string, string[]> BrandToModels = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Volkswagen"] = new[] { "Passat", "Golf" },
        ["VW"] = new[] { "Passat", "Golf" },
        ["Renault"] = new[] { "Megane", "Clio" },
        ["Toyota"] = new[] { "Corolla" },
        ["Fiat"] = new[] { "Egea" },
        ["Ford"] = new[] { "Focus" },
        ["Honda"] = new[] { "Civic" },
        ["Hyundai"] = new[] { "Tucson" },
        ["BMW"] = new[] { "320i" },
        ["Mercedes"] = new[] { "C 200" },
        ["Mercedes-Benz"] = new[] { "C 200" }
    };

    public TsbVehicleDto? LookupByTsbCode(string tsbCode)
    {
        if (string.IsNullOrWhiteSpace(tsbCode)) return null;
        var cleanCode = tsbCode.Trim();
        return Catalog.FirstOrDefault(c => c.TsbCode.Equals(cleanCode, StringComparison.OrdinalIgnoreCase));
    }

    public TsbVehicleDto? LookupByVehicleInfo(string brand, string model, int? modelYear = null, string? vin = null)
    {
        var cleanBrand = brand?.Trim() ?? string.Empty;
        var cleanModel = model?.Trim() ?? string.Empty;

        // 1. Try matching model name directly if model is provided
        if (!string.IsNullOrWhiteSpace(cleanModel))
        {
            var directMatch = Catalog.FirstOrDefault(c =>
                c.MarketName.Contains(cleanModel, StringComparison.OrdinalIgnoreCase));
            if (directMatch != null) return directMatch;
        }

        // 2. Try inferring from VIN prefix (e.g. WVW -> VW, VF1 -> Renault, etc.)
        if (!string.IsNullOrWhiteSpace(vin))
        {
            var cleanVin = vin.Trim().ToUpperInvariant();
            if (cleanVin.StartsWith("WVW") || cleanVin.StartsWith("WV1") || cleanVin.StartsWith("WV2"))
                return Catalog.First(c => c.TsbCode == "1531245"); // Passat
            if (cleanVin.StartsWith("VF1"))
                return Catalog.First(c => c.TsbCode == "1042301"); // Megane
            if (cleanVin.StartsWith("NMT") || cleanVin.StartsWith("SB1") || cleanVin.StartsWith("JT"))
                return Catalog.First(c => c.TsbCode == "2081190"); // Corolla
            if (cleanVin.StartsWith("NM4") || cleanVin.StartsWith("ZFA"))
                return Catalog.First(c => c.TsbCode == "3015401"); // Egea
            if (cleanVin.StartsWith("WF0"))
                return Catalog.First(c => c.TsbCode == "4021105"); // Focus
            if (cleanVin.StartsWith("SHH") || cleanVin.StartsWith("JHM"))
                return Catalog.First(c => c.TsbCode == "5032204"); // Civic
            if (cleanVin.StartsWith("TMA") || cleanVin.StartsWith("KMH"))
                return Catalog.First(c => c.TsbCode == "6041300"); // Tucson
            if (cleanVin.StartsWith("WBA") || cleanVin.StartsWith("WBS"))
                return Catalog.First(c => c.TsbCode == "7051400"); // 320i
            if (cleanVin.StartsWith("WDB") || cleanVin.StartsWith("W1K") || cleanVin.StartsWith("WDD"))
                return Catalog.First(c => c.TsbCode == "8061500"); // C 200
        }

        // 3. Try matching by brand
        if (!string.IsNullOrWhiteSpace(cleanBrand))
        {
            if (BrandToModels.TryGetValue(cleanBrand, out var brandModels))
            {
                var brandMatch = Catalog.FirstOrDefault(c =>
                    brandModels.Any(m => c.MarketName.Contains(m, StringComparison.OrdinalIgnoreCase)));
                if (brandMatch != null) return brandMatch;
            }
        }

        return Catalog.FirstOrDefault();
    }

    public IReadOnlyList<TsbVehicleDto> SearchVehicles(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return Catalog;
        var q = query.Trim();
        return Catalog
            .Where(c => c.TsbCode.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                        c.MarketName.Contains(q, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }
}
