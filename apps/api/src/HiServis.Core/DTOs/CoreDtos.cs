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

// --- Phase 2: Supply Chain, Receiving & Sealed QR DTOs ---

public record CreatePurchaseOrderLineRequest(
    string PartSku,
    string PartDescription,
    int OrderedQuantity,
    decimal UnitPrice,
    string? OemCode = null,
    Guid? WorkOrderPartRequestId = null
);

public record CreatePurchaseOrderRequest(
    string SupplierName,
    string? SupplierTaxNo,
    List<CreatePurchaseOrderLineRequest> Lines,
    Guid? BranchId = null,
    string? Status = "Ordered"
);

public record PurchaseOrderLineDto(
    Guid Id,
    Guid PurchaseOrderId,
    string PartSku,
    string? OemCode,
    string PartDescription,
    int OrderedQuantity,
    int ReceivedQuantity,
    decimal UnitPrice,
    decimal LineTotal,
    string Status,
    Guid? LinkedPartRequestId = null,
    string? LinkedWorkOrderNumber = null,
    string? LinkedPlate = null
);

public record PurchaseOrderDto(
    Guid Id,
    Guid TenantId,
    Guid BranchId,
    string PoNumber,
    string SupplierName,
    string? SupplierTaxNo,
    PoStatus Status,
    decimal TotalAmount,
    int TotalOrderedQuantity,
    int TotalReceivedQuantity,
    DateTimeOffset CreatedAt,
    List<PurchaseOrderLineDto> Lines
);

public record ReceivePoLineRequest(
    int Quantity
);

public record ReceivePoLineResultDto(
    Guid PoId,
    Guid LineId,
    int QuantityReceivedThisBatch,
    int TotalReceivedQuantity,
    int OrderedQuantity,
    string LineStatus,
    PoStatus PoStatus,
    string Message
);

public record PartMatchCandidateDto(
    Guid PartRequestId,
    Guid WorkOrderId,
    string WorkOrderNumber,
    string Plate,
    string VehicleDescription,
    string CustomerName,
    string? TechnicianName,
    string? BayName,
    string PartName,
    string PartSku,
    int RequestedQuantity,
    int AllocatedQuantity,
    string Priority,
    bool IsUrgent,
    DateTimeOffset WorkOrderCreatedAt
);

public record AllocatePartRequest(
    Guid PartRequestId,
    string ScannedBarcode,
    Guid? PoLineId = null,
    Guid? TargetWarehouseId = null,
    bool PrintLabelImmediately = true
);

public record AllocatePartResultDto(
    Guid PartRequestId,
    Guid WorkOrderId,
    string WorkOrderNumber,
    string Plate,
    string? Vin,
    string PartName,
    string PartSku,
    string InternalSealedQr,
    string EscPosPayloadBase64,
    string EscPosCommandsHex,
    string ThermalLabelText,
    DateTimeOffset AllocatedAt,
    string Message
);

public record VerifyInstallationRequest(
    Guid WorkOrderId,
    string ScannedQr
);

public record VerifyInstallationResultDto(
    bool IsValid,
    bool IsCrossAssemblyLocked,
    string Message,
    string? PartName = null,
    string? AllocatedToPlate = null,
    string? AllocatedToWorkOrderNumber = null
);

public record ReturnPartRequest(
    Guid PartRequestId,
    string Reason,
    string? Notes = null,
    bool RequestNewPart = true
);

public record ReturnPartResultDto(
    bool Success,
    string Message,
    Guid? NewPartRequestId = null,
    string? ReturnShelf = null
);

public record CreateWorkOrderPartRequest(
    string PartSku,
    string PartName,
    int RequestedQuantity = 1,
    Guid? TargetWarehouseId = null
);

public record WorkOrderPartRequestDto(
    Guid Id,
    Guid WorkOrderId,
    string PartSku,
    string PartName,
    int RequestedQuantity,
    int AllocatedQuantity,
    string? InternalSealedQr,
    string Status,
    Guid? PoLineId,
    Guid? TargetWarehouseId
);

public record VanStockTransferRequest(
    Guid SourceWarehouseId,
    Guid TargetWarehouseId,
    string PartSku,
    string PartName,
    int Quantity
);

public record VanStockTransferResultDto(
    bool Success,
    string Message,
    string WaybillNumber,
    Guid TransferId,
    DateTimeOffset TransferredAt
);

