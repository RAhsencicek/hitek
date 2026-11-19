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
    DateTimeOffset CreatedAt
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
