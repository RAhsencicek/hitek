using HiServis.Core.Enums;

namespace HiServis.Core.Entities;

public class Tenant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty;
    public string SubscriptionTier { get; set; } = "Professional";
    public int SmsBalance { get; set; } = 50;
    public int WhatsAppBalance { get; set; } = 200;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    public ICollection<Asset> Assets { get; set; } = new List<Asset>();
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

public class Branch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Phone { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Technician;
    public string PinHash { get; set; } = string.Empty; // Rapid 4-digit PIN hash
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class Warehouse
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
    public string Name { get; set; } = string.Empty;
    public WarehouseType WarehouseType { get; set; } = WarehouseType.BranchRack;
    public Guid? AssignedUserId { get; set; }
    public User? AssignedUser { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Asset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public string PrimaryIdentifier { get; set; } = string.Empty; // e.g., '34 ABC 123'
    public string? SecondaryIdentifier { get; set; } // VIN / Şase
    public string AssetType { get; set; } = "Automotive";
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int? ModelYear { get; set; }
    public string? EngineCode { get; set; }
    public string? TsbCode { get; set; }
    public int CurrentMeter { get; set; } = 0; // KM
    public DateTimeOffset? LastServiceDate { get; set; }
    public string DynamicAttributesJson { get; set; } = "{}";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
}

public class WorkOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public Guid BranchId { get; set; }
    public Branch? Branch { get; set; }
    public Guid AssetId { get; set; }
    public Asset? Asset { get; set; }

    public string WorkOrderNumber { get; set; } = string.Empty; // e.g. WO-2026-10492
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public Guid? TechnicianUserId { get; set; }
    public User? TechnicianUser { get; set; }

    public WorkOrderStatus Status { get; set; } = WorkOrderStatus.Open;
    public int IntakeMeter { get; set; }
    public string? CustomerComplaint { get; set; }
    public string? InternalNotes { get; set; }

    public decimal GrandTotal { get; set; } = 0.00m;
    public decimal PaidAmount { get; set; } = 0.00m;
    public decimal RemainingBalance { get; set; } = 0.00m;

    public string ErpSyncStatus { get; set; } = "NotSynced";
    public string? ErpInvoiceNumber { get; set; }
    public long HlcTimestamp { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<WorkOrderLine> Lines { get; set; } = new List<WorkOrderLine>();
    public ICollection<WorkOrderPartRequest> PartRequests { get; set; } = new List<WorkOrderPartRequest>();
}

public class WorkOrderLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid WorkOrderId { get; set; }
    public WorkOrder? WorkOrder { get; set; }

    public string LineType { get; set; } = "Labor"; // Labor, Part, Subcontract, Diagnostic
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1.0m;
    public decimal UnitPrice { get; set; } = 0.00m;
    public decimal DiscountRate { get; set; } = 0.00m;
    public decimal TotalAmount { get; set; } = 0.00m;
    public bool IsApprovedByCustomer { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class WorkOrderPartRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid WorkOrderId { get; set; }
    public WorkOrder? WorkOrder { get; set; }
    public Guid? PoLineId { get; set; }

    public string PartSku { get; set; } = string.Empty;
    public string PartName { get; set; } = string.Empty;
    public int RequestedQuantity { get; set; } = 1;
    public int AllocatedQuantity { get; set; } = 0;
    public string? InternalSealedQr { get; set; } // Sealed QR string
    public string Status { get; set; } = "Pending"; // Pending, Ordered, Allocated, Installed, Returned
    public Guid? TargetWarehouseId { get; set; }
}

public class PurchaseOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    public string PoNumber { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierTaxNo { get; set; }
    public PoStatus Status { get; set; } = PoStatus.Draft;
    public decimal TotalAmount { get; set; } = 0.00m;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<PurchaseOrderLine> Lines { get; set; } = new List<PurchaseOrderLine>();
}

public class PurchaseOrderLine
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public string PartSku { get; set; } = string.Empty;
    public string? OemCode { get; set; }
    public string PartDescription { get; set; } = string.Empty;
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; } = 0;
    public decimal UnitPrice { get; set; }
    public string Status { get; set; } = "Pending";
}

public class QuarantineIncident
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid WorkOrderId { get; set; }
    public WorkOrder? WorkOrder { get; set; }

    public string ConflictType { get; set; } = "STATUS_CONFLICT_CANCEL_VS_COMPLETE";
    public string ServerStateJson { get; set; } = "{}";
    public string ClientStateJson { get; set; } = "{}";
    public string ResolutionStatus { get; set; } = "PendingReview";
    public string? ResolutionAction { get; set; }
    public string? ManagerNotes { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class OutboxEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TenantId { get; set; }
    public string AggregateType { get; set; } = string.Empty;
    public Guid AggregateId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public int RetryCount { get; set; } = 0;
    public DateTimeOffset? ProcessedAt { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
