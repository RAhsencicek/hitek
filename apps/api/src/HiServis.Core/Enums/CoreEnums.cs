using System.Text.Json.Serialization;

namespace HiServis.Core.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum WorkOrderStatus
{
    Open,               // Yeni Kabul / Açık
    InProgress,         // Lifte Alındı / İşlemde
    WaitingParts,       // Parça Bekleniyor
    CustomerApproval,   // Müşteri Onayı Bekliyor
    Completed,          // Tamamlandı / Kalite Kontrol
    Invoiced,           // Faturalandı / Teslim Edildi
    Cancelled,          // İptal Edildi
    [JsonStringEnumMemberName("QUARANTINE_REVIEW")]
    QuarantineReview    // Karantinada / İnceleme Gerekli
}

public enum UserRole
{
    Owner,
    BranchManager,
    Technician,
    WarehouseMaster,
    Accounting
}

public enum WarehouseType
{
    Central,
    BranchRack,
    VanStock,
    Scrap
}

public enum PoStatus
{
    Draft,
    Ordered,
    PartialReceived,
    Completed,
    Cancelled
}

public enum QuarantineConflictType
{
    StatusConflictCancelVsComplete,
    StockDeficit,
    UnauthorizedOverride
}
