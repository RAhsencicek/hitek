using HiServis.Core.Enums;

namespace HiServis.Core.DTOs;

public record PinLoginRequest(string Phone, string Pin, Guid? PreferredBranchId = null);

public record AuthResult(
    bool Success,
    string? Token,
    string? ErrorMessage,
    Guid? TenantId = null,
    Guid? BranchId = null,
    Guid? UserId = null,
    string? FullName = null,
    string? Role = null
);

public record WorkOrderDto(
    Guid Id,
    Guid TenantId,
    Guid BranchId,
    string WorkOrderNumber,
    string Plate,
    string VehicleDescription,
    string CustomerName,
    string CustomerPhone,
    WorkOrderStatus Status,
    int IntakeMeter,
    string? CustomerComplaint,
    decimal GrandTotal,
    decimal RemainingBalance,
    DateTimeOffset CreatedAt,
    string Priority = "Normal",
    Guid? BayId = null,
    bool IsLaborRunning = false,
    int LaborElapsedSeconds = 0,
    int TargetLaborMinutes = 120
);

public record CreateWorkOrderRequest(
    string Plate,
    string Brand,
    string Model,
    int IntakeMeter,
    string CustomerName,
    string CustomerPhone,
    string? CustomerComplaint,
    Guid? TechnicianUserId
);

public record AssetDto(
    Guid Id,
    string PrimaryIdentifier,
    string? SecondaryIdentifier,
    string Brand,
    string Model,
    int? ModelYear,
    int CurrentMeter
);

// --- Phase 1: Intake & Bay DTOs ---

public record DamageMarkerDto(
    string Zone,
    string DamageType,
    string? PhotoUrl = null,
    double? XPercent = null,
    double? YPercent = null,
    string? Notes = null
);

public record WorkOrderSummaryDto(
    Guid Id,
    string WorkOrderNumber,
    WorkOrderStatus Status,
    int IntakeMeter,
    string? CustomerComplaint,
    decimal GrandTotal,
    decimal RemainingBalance,
    string Priority,
    DateTimeOffset CreatedAt
);

public record AssetLookupResultDto(
    bool Found,
    AssetDto? Asset,
    List<WorkOrderSummaryDto> RecentWorkOrders,
    decimal TotalOutstandingBalance,
    string? Message = null
);

public record TsbVehicleDto(
    string TsbCode,
    string MarketName,
    int EngineDisplacementCc,
    int HorsePowerHp,
    string FuelType,
    string Transmission
);

public record RegistrationCardOcrResult(
    string PlateNumber,
    string Vin,
    string EngineNumber,
    string Brand,
    string Model,
    int ModelYear,
    string Color,
    string DocumentSerial,
    DateTimeOffset FirstRegistrationDate,
    double ConfidenceScore,
    TsbVehicleDto? TsbVehicle
);

public record RegistrationCardOcrRequest(
    string? ImageBase64 = null,
    string? FileName = null,
    string? RawText = null,
    string? MockVehiclePreset = null
);

public record CreateIntakeAssetRequest(
    string PlateNumber,
    string? Vin,
    string Brand,
    string Model,
    int? ModelYear,
    string? TsbCode,
    int CurrentMeter
);

public record CreateIntakeCustomerRequest(
    string FullName,
    string Phone,
    string? Email,
    bool IsCorporate = false
);

public record CreateIntakeDetailsRequest(
    int IntakeMeter,
    string? CustomerComplaint,
    double? FuelLevelRatio = null,
    List<DamageMarkerDto>? DamageInspectionMarkers = null
);

public record CreateIntakeRequest(
    Guid? BranchId,
    CreateIntakeAssetRequest Asset,
    CreateIntakeCustomerRequest Customer,
    CreateIntakeDetailsRequest IntakeDetails,
    Guid? TechnicianUserId = null,
    Guid? BayId = null,
    string? Priority = "Normal"
);

public record IntakeResultDto(
    Guid WorkOrderId,
    string WorkOrderNumber,
    Guid AssetId,
    string Plate,
    string VehicleDescription,
    string CustomerName,
    string CustomerPhone,
    WorkOrderStatus Status,
    int IntakeMeter,
    string? CustomerComplaint,
    string Priority,
    List<DamageMarkerDto> DamageMarkers,
    DateTimeOffset CreatedAt,
    string? CustomerMagicLink = null
);

public record WorkshopBayDto(
    Guid Id,
    Guid BranchId,
    string BayCode,
    string Name,
    string BayType,
    Guid? AssignedTechnicianId,
    string? AssignedTechnicianName,
    Guid? CurrentWorkOrderId,
    WorkOrderDto? CurrentWorkOrder,
    bool IsActive,
    int QueueCount = 0
);

public record AssignBayRequest(
    Guid WorkOrderId,
    Guid? TechnicianUserId = null
);

public record UpdateWorkOrderStatusRequest(
    WorkOrderStatus Status
);

public record LaborTimerResultDto(
    Guid WorkOrderId,
    string WorkOrderNumber,
    bool IsLaborRunning,
    int ElapsedSeconds,
    int TargetMinutes,
    double EfficiencyPercentage,
    DateTimeOffset? StartedAt
);

public record CustomerIntakeReceiptDto(
    string WorkOrderNumber,
    DateTimeOffset IntakeDate,
    string Plate,
    string BrandModel,
    int ModelYear,
    string Vin,
    int Meter,
    string CustomerName,
    string CustomerPhone,
    string Complaint,
    double? FuelLevelRatio,
    List<DamageMarkerDto> DamageMarkers,
    string ServiceAdvisor,
    string BranchName,
    string BranchPhone
);
