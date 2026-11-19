-- HiServis AI — PostgreSQL 17 Core DDL Schema
-- Architecture Specification: PROJE_ANAYASASI.md v1.1

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS & MULTI-BRANCH HIERARCHY
CREATE TABLE IF NOT EXISTS Tenants (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(150) NOT NULL,
    TaxNumber VARCHAR(20) NOT NULL,
    Subdomain VARCHAR(50) UNIQUE NOT NULL,
    SubscriptionTier VARCHAR(30) NOT NULL DEFAULT 'Professional', -- Starter, Professional, Enterprise
    SmsBalance INT NOT NULL DEFAULT 50,
    WhatsAppBalance INT NOT NULL DEFAULT 200,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS Branches (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    Name VARCHAR(100) NOT NULL, -- e.g., 'Maslak Şubesi', 'Bostancı Şubesi'
    City VARCHAR(50) NOT NULL,
    Phone VARCHAR(20),
    IsActive BOOLEAN NOT NULL DEFAULT true,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES Branches(Id) ON DELETE RESTRICT,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(150),
    Phone VARCHAR(20) NOT NULL,
    Role VARCHAR(30) NOT NULL, -- 'Owner', 'BranchManager', 'Technician', 'WarehouseMaster', 'Accounting'
    PinHash VARCHAR(128) NOT NULL, -- 4-digit PIN Argon2/PBKDF2 hash for rapid workshop login
    IsActive BOOLEAN NOT NULL DEFAULT true,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS Warehouses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES Branches(Id) ON DELETE RESTRICT,
    Name VARCHAR(100) NOT NULL, -- e.g., 'Maslak Ana Raf', '34-ABC-01 Gezici Araç (Van Stock)'
    WarehouseType VARCHAR(30) NOT NULL DEFAULT 'BranchRack', -- Central, BranchRack, VanStock, Scrap
    AssignedUserId UUID REFERENCES Users(Id), -- If mobile van stock, assigned technician ID
    IsActive BOOLEAN NOT NULL DEFAULT true
);

-- 2. ASSETS (AUTOMOTIVE DEPTH)
CREATE TABLE IF NOT EXISTS Assets (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    PrimaryIdentifier VARCHAR(50) NOT NULL, -- Turkish Plate: '34 ABC 123'
    SecondaryIdentifier VARCHAR(50),        -- Chassis / VIN: 'WVWZZZ3CZWE...'
    AssetType VARCHAR(30) NOT NULL DEFAULT 'Automotive',
    Brand VARCHAR(60) NOT NULL,             -- e.g., 'Volkswagen'
    Model VARCHAR(60) NOT NULL,             -- e.g., 'Passat 1.6 TDI'
    ModelYear INT,
    EngineCode VARCHAR(30),
    TsbCode VARCHAR(30),                    -- Türkiye Sigorta Birliği Kasko Araç Kodu
    CurrentMeter INT NOT NULL DEFAULT 0,    -- Güncel Kilometre
    LastServiceDate TIMESTAMPTZ,
    DynamicAttributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- Body damage coordinates, tire dimensions
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_assets_tenant_plate ON Assets (TenantId, PrimaryIdentifier);
CREATE INDEX IF NOT EXISTS idx_assets_vin ON Assets (TenantId, SecondaryIdentifier);

-- 3. PURCHASE ORDERS (SUPPLIER INTEGRATION)
CREATE TABLE IF NOT EXISTS PurchaseOrders (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES Branches(Id) ON DELETE RESTRICT,
    PoNumber VARCHAR(50) NOT NULL, -- PO-2026-0001
    SupplierName VARCHAR(150) NOT NULL, -- Başbuğ Oto, Martaş vb.
    SupplierTaxNo VARCHAR(20),
    Status VARCHAR(30) NOT NULL DEFAULT 'Draft', -- Draft, Ordered, PartialReceived, Completed, Cancelled
    TotalAmount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS PurchaseOrderLines (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    PurchaseOrderId UUID NOT NULL REFERENCES PurchaseOrders(Id) ON DELETE CASCADE,
    PartSku VARCHAR(50) NOT NULL,
    OemCode VARCHAR(50),
    PartDescription VARCHAR(200) NOT NULL,
    OrderedQuantity INT NOT NULL,
    ReceivedQuantity INT NOT NULL DEFAULT 0,
    UnitPrice NUMERIC(12,2) NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'Pending' -- Pending, PartiallyReceived, Received, Cancelled
);

-- 4. WORK ORDERS, WORKSHOP BAYS & DISPATCH
CREATE TABLE IF NOT EXISTS WorkshopBays (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES Branches(Id) ON DELETE RESTRICT,
    BayCode VARCHAR(50) NOT NULL, -- 'LIFT-1', 'LIFT-2', 'BAY-QC'
    Name VARCHAR(100) NOT NULL,    -- 'LİFT 1 (Mekanik / Ağır Bakım)'
    BayType VARCHAR(50) NOT NULL DEFAULT 'Mechanic',
    AssignedTechnicianId UUID REFERENCES Users(Id),
    CurrentWorkOrderId UUID, -- Forward reference to WorkOrders(Id)
    IsActive BOOLEAN NOT NULL DEFAULT true,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS WorkOrders (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES Branches(Id) ON DELETE RESTRICT,
    AssetId UUID NOT NULL REFERENCES Assets(Id) ON DELETE RESTRICT,
    WorkOrderNumber VARCHAR(50) NOT NULL, -- WO-2026-10492
    CustomerName VARCHAR(150) NOT NULL,
    CustomerPhone VARCHAR(25) NOT NULL,
    TechnicianUserId UUID REFERENCES Users(Id),
    BayId UUID REFERENCES WorkshopBays(Id),
    Priority VARCHAR(30) NOT NULL DEFAULT 'Normal', -- Normal, Urgent, Waiter, PartsArrived, Vip
    Status VARCHAR(30) NOT NULL DEFAULT 'Open', -- Open, InProgress, WaitingParts, CustomerApproval, Completed, Invoiced, Cancelled, QUARANTINE_REVIEW
    IntakeMeter INT NOT NULL, -- Giriş Kilometresi
    CustomerComplaint TEXT,
    InternalNotes TEXT,
    DamageMarkersJson JSONB NOT NULL DEFAULT '[]'::jsonb,
    TargetLaborMinutes INT NOT NULL DEFAULT 120,
    LaborStartedAt TIMESTAMPTZ,
    LaborElapsedSeconds INT NOT NULL DEFAULT 0,
    IsLaborRunning BOOLEAN NOT NULL DEFAULT false,
    GrandTotal NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    PaidAmount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    RemainingBalance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    ErpSyncStatus VARCHAR(30) NOT NULL DEFAULT 'NotSynced', -- NotSynced, Queued, Synced, SyncFailed
    ErpInvoiceNumber VARCHAR(50),
    HlcTimestamp BIGINT NOT NULL, -- Hybrid Logical Clock (Offline Sync)
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_workorders_tenant_branch ON WorkOrders (TenantId, BranchId);
CREATE INDEX IF NOT EXISTS idx_workorders_status ON WorkOrders (Status);

CREATE TABLE IF NOT EXISTS WorkOrderLines (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    WorkOrderId UUID NOT NULL REFERENCES WorkOrders(Id) ON DELETE CASCADE,
    LineType VARCHAR(30) NOT NULL DEFAULT 'Labor', -- Labor, Part, Subcontract, Diagnostic
    Description VARCHAR(250) NOT NULL,
    Quantity NUMERIC(10,2) NOT NULL DEFAULT 1.0,
    UnitPrice NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    DiscountRate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    TotalAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    IsApprovedByCustomer BOOLEAN NOT NULL DEFAULT true,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS WorkOrderPartRequests (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    WorkOrderId UUID NOT NULL REFERENCES WorkOrders(Id) ON DELETE CASCADE,
    PoLineId UUID REFERENCES PurchaseOrderLines(Id), -- Linked PO line when purchased
    PartSku VARCHAR(50) NOT NULL,
    PartName VARCHAR(200) NOT NULL,
    RequestedQuantity INT NOT NULL DEFAULT 1,
    AllocatedQuantity INT NOT NULL DEFAULT 0,
    InternalSealedQr VARCHAR(100), -- Sealed Plate+VIN+WO Security QR
    Status VARCHAR(30) NOT NULL DEFAULT 'Pending', -- Pending, Ordered, Allocated, Installed, Returned
    TargetWarehouseId UUID REFERENCES Warehouses(Id)
);

-- 5. QUARANTINE & DISPUTE REVIEW (OFFLINE CONFLICT RESOLUTION)
CREATE TABLE IF NOT EXISTS QuarantineIncidents (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES Branches(Id) ON DELETE RESTRICT,
    WorkOrderId UUID NOT NULL REFERENCES WorkOrders(Id) ON DELETE RESTRICT,
    ConflictType VARCHAR(50) NOT NULL, -- 'STATUS_CONFLICT_CANCEL_VS_COMPLETE', 'STOCK_DEFICIT'
    ServerState JSONB NOT NULL,
    ClientState JSONB NOT NULL,
    ResolutionStatus VARCHAR(30) NOT NULL DEFAULT 'PendingReview', -- PendingReview, ResolvedByManager, Dismissed
    ResolutionAction VARCHAR(50), -- 'AcceptClientState', 'AcceptServerState', 'ManualCorrection'
    ManagerNotes TEXT,
    ResolvedByUserId UUID REFERENCES Users(Id),
    ResolvedAt TIMESTAMPTZ,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. TRANSACTIONAL OUTBOX EVENTS
CREATE TABLE IF NOT EXISTS OutboxEvents (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES Tenants(Id) ON DELETE RESTRICT,
    AggregateType VARCHAR(50) NOT NULL, -- 'WorkOrder', 'PurchaseOrder', 'VoiceAudio'
    AggregateId UUID NOT NULL,
    EventType VARCHAR(100) NOT NULL,    -- 'WorkOrderCompletedEvent', 'VoiceTranscriptRequested'
    Payload JSONB NOT NULL,
    RetryCount INT NOT NULL DEFAULT 0,
    ProcessedAt TIMESTAMPTZ,
    ErrorMessage TEXT,
    CreatedAt TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_outbox_unprocessed ON OutboxEvents (ProcessedAt) WHERE ProcessedAt IS NULL;
