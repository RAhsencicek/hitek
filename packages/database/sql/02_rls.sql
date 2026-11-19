-- HiServis AI — PostgreSQL 17 Row-Level Security (RLS) Policies
-- Specification: PROJE_ANAYASASI.md & TEKNIK_MIMARI.md

-- ============================================================================
-- 1. HELPER SESSION CONTEXT ACCESSORS
-- ============================================================================
CREATE OR REPLACE FUNCTION app_current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_current_branch_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_branch_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_is_tenant_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(current_setting('app.is_tenant_admin', true) = 'true', false);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION app_is_auth_lookup() RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(current_setting('app.is_auth_lookup', true) = 'true', false);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- 2. ENABLE & FORCE RLS ON MULTI-TENANT TABLES
-- ============================================================================
ALTER TABLE Tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE Tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE Branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE Branches FORCE ROW LEVEL SECURITY;

ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE Users FORCE ROW LEVEL SECURITY;

ALTER TABLE Warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE Warehouses FORCE ROW LEVEL SECURITY;

ALTER TABLE Assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE Assets FORCE ROW LEVEL SECURITY;

ALTER TABLE PurchaseOrders ENABLE ROW LEVEL SECURITY;
ALTER TABLE PurchaseOrders FORCE ROW LEVEL SECURITY;

ALTER TABLE PurchaseOrderLines ENABLE ROW LEVEL SECURITY;
ALTER TABLE PurchaseOrderLines FORCE ROW LEVEL SECURITY;

ALTER TABLE WorkOrders ENABLE ROW LEVEL SECURITY;
ALTER TABLE WorkOrders FORCE ROW LEVEL SECURITY;

ALTER TABLE WorkshopBays ENABLE ROW LEVEL SECURITY;
ALTER TABLE WorkshopBays FORCE ROW LEVEL SECURITY;

ALTER TABLE WorkOrderLines ENABLE ROW LEVEL SECURITY;
ALTER TABLE WorkOrderLines FORCE ROW LEVEL SECURITY;

ALTER TABLE WorkOrderPartRequests ENABLE ROW LEVEL SECURITY;
ALTER TABLE WorkOrderPartRequests FORCE ROW LEVEL SECURITY;

ALTER TABLE QuarantineIncidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE QuarantineIncidents FORCE ROW LEVEL SECURITY;

ALTER TABLE OutboxEvents ENABLE ROW LEVEL SECURITY;
ALTER TABLE OutboxEvents FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. DEFINE POLICIES
-- ============================================================================

-- Tenants: Tenant can only view and update its own organization profile (or during auth lookup)
DROP POLICY IF EXISTS rls_tenants_isolation_policy ON Tenants;
CREATE POLICY rls_tenants_isolation_policy ON Tenants
FOR ALL
USING (app_is_auth_lookup() OR Id = app_current_tenant_id())
WITH CHECK (app_is_auth_lookup() OR Id = app_current_tenant_id());

-- Branches: Tenant isolation (or during auth lookup)
DROP POLICY IF EXISTS rls_branches_tenant_policy ON Branches;
CREATE POLICY rls_branches_tenant_policy ON Branches
FOR ALL
USING (app_is_auth_lookup() OR TenantId = app_current_tenant_id())
WITH CHECK (app_is_auth_lookup() OR TenantId = app_current_tenant_id());

-- Users: Tenant isolation (Owner sees all branch users, otherwise scoped to branch or tenant; auth lookup allowed for login)
DROP POLICY IF EXISTS rls_users_tenant_policy ON Users;
CREATE POLICY rls_users_tenant_policy ON Users
FOR ALL
USING (
    app_is_auth_lookup()
    OR (
        TenantId = app_current_tenant_id()
        AND (
            app_is_tenant_admin()
            OR BranchId = app_current_branch_id()
        )
    )
)
WITH CHECK (
    app_is_auth_lookup()
    OR (
        TenantId = app_current_tenant_id()
        AND (
            app_is_tenant_admin()
            OR BranchId = app_current_branch_id()
        )
    )
);

-- Warehouses: Scoped to tenant and branch (or tenant admin)
DROP POLICY IF EXISTS rls_warehouses_isolation_policy ON Warehouses;
CREATE POLICY rls_warehouses_isolation_policy ON Warehouses
FOR ALL
USING (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
)
WITH CHECK (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
);

-- Assets: Scoped to Tenant (Vehicles can visit multiple branches within same tenant)
DROP POLICY IF EXISTS rls_assets_tenant_policy ON Assets;
CREATE POLICY rls_assets_tenant_policy ON Assets
FOR ALL
USING (TenantId = app_current_tenant_id())
WITH CHECK (TenantId = app_current_tenant_id());

-- PurchaseOrders: Scoped to Tenant & Branch
DROP POLICY IF EXISTS rls_purchaseorders_isolation_policy ON PurchaseOrders;
CREATE POLICY rls_purchaseorders_isolation_policy ON PurchaseOrders
FOR ALL
USING (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
)
WITH CHECK (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
);

-- PurchaseOrderLines: Scoped to Tenant
DROP POLICY IF EXISTS rls_purchaseorderlines_tenant_policy ON PurchaseOrderLines;
CREATE POLICY rls_purchaseorderlines_tenant_policy ON PurchaseOrderLines
FOR ALL
USING (TenantId = app_current_tenant_id())
WITH CHECK (TenantId = app_current_tenant_id());

-- WorkOrders: Core operational table with strict tenant & branch policy
DROP POLICY IF EXISTS rls_workorders_isolation_policy ON WorkOrders;
CREATE POLICY rls_workorders_isolation_policy ON WorkOrders
FOR ALL
USING (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
)
WITH CHECK (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
);

-- WorkshopBays: Scoped to Tenant & Branch
DROP POLICY IF EXISTS rls_workshopbays_isolation_policy ON WorkshopBays;
CREATE POLICY rls_workshopbays_isolation_policy ON WorkshopBays
FOR ALL
USING (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
)
WITH CHECK (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
);

-- WorkOrderLines: Scoped to Tenant
DROP POLICY IF EXISTS rls_workorderlines_tenant_policy ON WorkOrderLines;
CREATE POLICY rls_workorderlines_tenant_policy ON WorkOrderLines
FOR ALL
USING (TenantId = app_current_tenant_id())
WITH CHECK (TenantId = app_current_tenant_id());

-- WorkOrderPartRequests: Scoped to Tenant
DROP POLICY IF EXISTS rls_workorderparts_tenant_policy ON WorkOrderPartRequests;
CREATE POLICY rls_workorderparts_tenant_policy ON WorkOrderPartRequests
FOR ALL
USING (TenantId = app_current_tenant_id())
WITH CHECK (TenantId = app_current_tenant_id());

-- QuarantineIncidents: Scoped to Tenant & Branch
DROP POLICY IF EXISTS rls_quarantine_isolation_policy ON QuarantineIncidents;
CREATE POLICY rls_quarantine_isolation_policy ON QuarantineIncidents
FOR ALL
USING (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
)
WITH CHECK (
    TenantId = app_current_tenant_id()
    AND (
        app_is_tenant_admin()
        OR BranchId = app_current_branch_id()
    )
);

-- ProcessedClientMutations: Scoped to Tenant (Idempotency)
DROP POLICY IF EXISTS rls_processedmutations_tenant_policy ON ProcessedClientMutations;
CREATE POLICY rls_processedmutations_tenant_policy ON ProcessedClientMutations
FOR ALL
USING (TenantId = app_current_tenant_id())
WITH CHECK (TenantId = app_current_tenant_id());

-- OutboxEvents: Scoped to Tenant
DROP POLICY IF EXISTS rls_outbox_tenant_policy ON OutboxEvents;
CREATE POLICY rls_outbox_tenant_policy ON OutboxEvents
FOR ALL
USING (TenantId = app_current_tenant_id())
WITH CHECK (TenantId = app_current_tenant_id());
