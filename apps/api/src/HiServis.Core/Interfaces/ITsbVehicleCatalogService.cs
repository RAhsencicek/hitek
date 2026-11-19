using HiServis.Core.DTOs;

namespace HiServis.Core.Interfaces;

public interface ITsbVehicleCatalogService
{
    TsbVehicleDto? LookupByTsbCode(string tsbCode);
    TsbVehicleDto? LookupByVehicleInfo(string brand, string model, int? modelYear = null, string? vin = null);
    IReadOnlyList<TsbVehicleDto> SearchVehicles(string query);
}
