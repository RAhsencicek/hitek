using System.Text.RegularExpressions;
using HiServis.Core.DTOs;
using HiServis.Core.Interfaces;

namespace HiServis.Infrastructure.Services;

public partial class RegistrationCardOcrService : IRegistrationCardOcrService
{
    private readonly ITsbVehicleCatalogService _tsbCatalogService;

    public RegistrationCardOcrService(ITsbVehicleCatalogService tsbCatalogService)
    {
        _tsbCatalogService = tsbCatalogService;
    }

    public Task<RegistrationCardOcrResult> ProcessRegistrationCardAsync(RegistrationCardOcrRequest request, CancellationToken ct = default)
    {
        // 1. Check for preset or simulated OCR modes
        var preset = request.MockVehiclePreset?.ToLowerInvariant().Trim();

        if (preset == "corolla" || (request.FileName != null && request.FileName.Contains("corolla", StringComparison.OrdinalIgnoreCase)))
        {
            var tsb = _tsbCatalogService.LookupByTsbCode("2081190");
            return Task.FromResult(new RegistrationCardOcrResult(
                PlateNumber: "35 CDE 789",
                Vin: "NMTEB3BE30R109823",
                EngineNumber: "2ZR109823",
                Brand: "TOYOTA",
                Model: "Corolla 1.8 Hybrid Dream",
                ModelYear: 2022,
                Color: "GÜMÜŞ GRİ",
                DocumentSerial: "BB789012",
                FirstRegistrationDate: DateTimeOffset.UtcNow.AddYears(-2),
                ConfidenceScore: 0.98,
                TsbVehicle: tsb
            ));
        }

        if (preset == "megane" || (request.FileName != null && request.FileName.Contains("megane", StringComparison.OrdinalIgnoreCase)))
        {
            var tsb = _tsbCatalogService.LookupByTsbCode("1042301");
            return Task.FromResult(new RegistrationCardOcrResult(
                PlateNumber: "06 BCD 456",
                Vin: "VF1RFB00858921045",
                EngineNumber: "K9K858921",
                Brand: "RENAULT",
                Model: "Megane 1.5 Blue dCi Icon",
                ModelYear: 2020,
                Color: "BEYAZ",
                DocumentSerial: "TR543210",
                FirstRegistrationDate: DateTimeOffset.UtcNow.AddYears(-4),
                ConfidenceScore: 0.95,
                TsbVehicle: tsb
            ));
        }

        // 2. Parse RawText if provided
        string plate = "34 ABC 123";
        string vin = "WVWZZZ3CZWE123456";
        string engineNo = "CXX123456";
        string brand = "VOLKSWAGEN";
        string model = "Passat 1.6 TDI Comfortline";
        int modelYear = 2021;
        string color = "BEYAZ";
        string docSerial = "AA123456";
        double confidence = 0.96;

        if (!string.IsNullOrWhiteSpace(request.RawText))
        {
            var text = request.RawText.ToUpperInvariant();

            // Plate Regex
            var plateMatch = PlateRegex().Match(text);
            if (plateMatch.Success)
            {
                plate = plateMatch.Value.Replace(" ", "");
            }

            // VIN Regex (17 characters alphanumeric without I, O, Q)
            var vinMatch = VinRegex().Match(text);
            if (vinMatch.Success)
            {
                vin = vinMatch.Value;
            }

            // Engine number regex
            var engineMatch = EngineRegex().Match(text);
            if (engineMatch.Success)
            {
                engineNo = engineMatch.Value;
            }

            // Brand detection
            if (text.Contains("VOLKSWAGEN") || text.Contains("VW")) brand = "VOLKSWAGEN";
            else if (text.Contains("RENAULT")) brand = "RENAULT";
            else if (text.Contains("TOYOTA")) brand = "TOYOTA";
            else if (text.Contains("FIAT")) brand = "FIAT";
            else if (text.Contains("FORD")) brand = "FORD";
            else if (text.Contains("HYUNDAI")) brand = "HYUNDAI";
            else if (text.Contains("HONDA")) brand = "HONDA";
            else if (text.Contains("BMW")) brand = "BMW";
            else if (text.Contains("MERCEDES")) brand = "MERCEDES";

            // Model detection from text
            if (text.Contains("EGEA")) model = "Egea 1.4 Fire";
            else if (text.Contains("MEGANE")) model = "Megane 1.5 Blue dCi";
            else if (text.Contains("CLIO")) model = "Clio 1.0 TCe";
            else if (text.Contains("COROLLA")) model = "Corolla 1.8 Hybrid";
            else if (text.Contains("PASSAT")) model = "Passat 1.6 TDI";
            else if (text.Contains("GOLF")) model = "Golf 1.5 eTSI";
            else if (text.Contains("FOCUS")) model = "Focus 1.5 EcoBlue";
            else if (text.Contains("CIVIC")) model = "Civic 1.5 VTEC Turbo";
            else if (text.Contains("TUCSON")) model = "Tucson 1.6 CRDi";
            else if (text.Contains("320I")) model = "320i Sedan";
            else if (text.Contains("C 200") || text.Contains("C200")) model = "C 200 4MATIC";

            // Model Year detection
            var yearMatch = ModelYearRegex().Match(text);
            if (yearMatch.Success && int.TryParse(yearMatch.Groups[1].Value, out var parsedYear))
            {
                modelYear = parsedYear;
            }

            // Color detection
            if (text.Contains("GÜMÜŞ") || text.Contains("GUMUS") || text.Contains("GRİ") || text.Contains("GRI")) color = "GÜMÜŞ GRİ";
            else if (text.Contains("SİYAH") || text.Contains("SIYAH")) color = "SİYAH";
            else if (text.Contains("KIRMIZI")) color = "KIRMIZI";
            else if (text.Contains("MAVİ") || text.Contains("MAVI")) color = "MAVİ";
            else if (text.Contains("BEYAZ")) color = "BEYAZ";

            confidence = 0.94;
        }

        // Enrich with TSB Vehicle Catalog
        var tsbVehicle = _tsbCatalogService.LookupByVehicleInfo(brand, model, modelYear, vin);

        var result = new RegistrationCardOcrResult(
            PlateNumber: plate,
            Vin: vin,
            EngineNumber: engineNo,
            Brand: brand,
            Model: tsbVehicle?.MarketName ?? model,
            ModelYear: modelYear,
            Color: color,
            DocumentSerial: docSerial,
            FirstRegistrationDate: DateTimeOffset.UtcNow.AddYears(-Math.Max(1, DateTime.UtcNow.Year - modelYear)),
            ConfidenceScore: confidence,
            TsbVehicle: tsbVehicle
        );

        return Task.FromResult(result);
    }

    [GeneratedRegex(@"\b\d{2}\s*[A-Z]{1,3}\s*\d{2,4}\b")]
    private static partial Regex PlateRegex();

    [GeneratedRegex(@"\b[A-HJ-NPR-Z0-9]{17}\b")]
    private static partial Regex VinRegex();

    [GeneratedRegex(@"\b[A-Z0-9]{6,12}\b")]
    private static partial Regex EngineRegex();

    [GeneratedRegex(@"(?:MODEL\s*YILI|YIL|TARIH|YILI)?\s*[:=\s]?\s*\b(19\d{2}|20\d{2})\b")]
    private static partial Regex ModelYearRegex();
}
