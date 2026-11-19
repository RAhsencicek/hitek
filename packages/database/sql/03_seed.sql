-- HiServis AI — Seed Data for Development & Testing
-- Consistent with scenarios in PROJE_ANAYASASI.md

DO $$
DECLARE
    v_tenant_id UUID := '11111111-1111-1111-1111-111111111111';
    v_branch_maslak UUID := '22222222-2222-2222-2222-222222222222';
    v_branch_bostanci UUID := '33333333-3333-3333-3333-333333333333';
    v_user_manager UUID := '44444444-4444-4444-4444-444444444444';
    v_user_tech_ahmet UUID := '55555555-5555-5555-5555-555555555555';
    v_warehouse_main UUID := '66666666-6666-6666-6666-666666666666';
    v_asset_passat UUID := '77777777-7777-7777-7777-777777777777';
    v_asset_megane UUID := '88888888-8888-8888-8888-888888888888';
    v_workorder_1 UUID := '99999999-9999-9999-9999-999999999999';
    v_bay_lift1 UUID := 'aaaaaaaa-1111-1111-1111-111111111111';
    v_bay_lift2 UUID := 'aaaaaaaa-2222-2222-2222-222222222222';
    v_bay_lift3 UUID := 'aaaaaaaa-3333-3333-3333-333333333333';
    v_bay_qc UUID := 'aaaaaaaa-4444-4444-4444-444444444444';
BEGIN
    -- 1. Tenant
    INSERT INTO Tenants (Id, Name, TaxNumber, Subdomain, SubscriptionTier, SmsBalance, WhatsAppBalance)
    VALUES (v_tenant_id, 'Örnek Maslak Otomotiv A.Ş.', '1234567890', 'maslak-oto', 'Enterprise', 150, 480)
    ON CONFLICT (Id) DO NOTHING;

    -- 2. Branches
    INSERT INTO Branches (Id, TenantId, Name, City, Phone, IsActive)
    VALUES 
        (v_branch_maslak, v_tenant_id, 'Maslak Atatürk Oto Sanayi Şubesi', 'İstanbul', '0212 555 0101', true),
        (v_branch_bostanci, v_tenant_id, 'Bostancı Oto Sanayi Şubesi', 'İstanbul', '0216 555 0202', true)
    ON CONFLICT (Id) DO NOTHING;

    -- 3. Users (PIN '1234' and '5678')
    INSERT INTO Users (Id, TenantId, BranchId, FullName, Email, Phone, Role, PinHash)
    VALUES
        (v_user_manager, v_tenant_id, v_branch_maslak, 'Hakan Danışman', 'hakan@maslakoto.com', '0532 100 2030', 'BranchManager', 'a601c9d529543e1b3c109cea166974d6287b696e5209c912f7db7702021076f3'), -- PIN: 1234 (SHA256 salted)
        (v_user_tech_ahmet, v_tenant_id, v_branch_maslak, 'Ahmet Usta', 'ahmet@maslakoto.com', '0533 200 3040', 'Technician', 'a601c9d529543e1b3c109cea166974d6287b696e5209c912f7db7702021076f3')
    ON CONFLICT (Id) DO NOTHING;

    -- 4. Warehouse
    INSERT INTO Warehouses (Id, TenantId, BranchId, Name, WarehouseType, AssignedUserId, IsActive)
    VALUES (v_warehouse_main, v_tenant_id, v_branch_maslak, 'Maslak Merkez Yedek Parça Rafı', 'BranchRack', NULL, true)
    ON CONFLICT (Id) DO NOTHING;

    -- 5. Assets (Vehicles)
    INSERT INTO Assets (Id, TenantId, PrimaryIdentifier, SecondaryIdentifier, Brand, Model, ModelYear, CurrentMeter, DynamicAttributes)
    VALUES 
        (v_asset_passat, v_tenant_id, '34 ABC 123', 'WVWZZZ3CZWE104921', 'Volkswagen', 'Passat 1.6 TDI Highline', 2021, 145200, '{"color": "Derin Siyah", "transmission": "DSG"}'),
        (v_asset_megane, v_tenant_id, '06 BCD 456', 'VF1RFB00858921045', 'Renault', 'Megane 1.5 dCi Icon', 2020, 89450, '{"color": "Beyaz", "transmission": "EDC"}')
    ON CONFLICT (Id) DO NOTHING;

    -- 6. Workshop Bays
    INSERT INTO WorkshopBays (Id, TenantId, BranchId, BayCode, Name, BayType, AssignedTechnicianId, IsActive)
    VALUES
        (v_bay_lift1, v_tenant_id, v_branch_maslak, 'LIFT-1', 'LİFT 1 (Mekanik / Ağır Bakım)', 'Mechanic', v_user_tech_ahmet, true),
        (v_bay_lift2, v_tenant_id, v_branch_maslak, 'LIFT-2', 'LİFT 2 (Periyodik Hızlı Bakım)', 'PeriodicMaintenance', NULL, true),
        (v_bay_lift3, v_tenant_id, v_branch_maslak, 'LIFT-3', 'LİFT 3 (Rot-Balans / Ön Takım)', 'WheelAlignment', NULL, true),
        (v_bay_qc, v_tenant_id, v_branch_maslak, 'BAY-QC', 'Kalite Kontrol & Teslimat', 'QualityInspection', v_user_manager, true)
    ON CONFLICT (Id) DO NOTHING;

    -- 7. Work Order
    INSERT INTO WorkOrders (Id, TenantId, BranchId, AssetId, WorkOrderNumber, CustomerName, CustomerPhone, TechnicianUserId, BayId, Priority, Status, IntakeMeter, CustomerComplaint, GrandTotal, HlcTimestamp)
    VALUES (
        v_workorder_1,
        v_tenant_id,
        v_branch_maslak,
        v_asset_passat,
        'WO-2026-10492',
        'Mehmet Yılmaz',
        '0532 999 8877',
        v_user_tech_ahmet,
        v_bay_lift1,
        'Urgent',
        'InProgress',
        145200,
        'Ön takımdan kasislerde gıcırtı ve frene basınca titreme geliyor.',
        4250.00,
        1763481600000
    )
    ON CONFLICT (Id) DO NOTHING;

    -- Update Lift 1 CurrentWorkOrderId
    UPDATE WorkshopBays SET CurrentWorkOrderId = v_workorder_1 WHERE Id = v_bay_lift1;

    -- 8. Work Order Lines
    INSERT INTO WorkOrderLines (TenantId, WorkOrderId, LineType, Description, Quantity, UnitPrice, TotalAmount)
    VALUES
        (v_tenant_id, v_workorder_1, 'Part', 'Bosch Ön Fren Balata Takımı', 1.0, 1850.00, 1850.00),
        (v_tenant_id, v_workorder_1, 'Part', 'Castrol Edge 5W-30 Motor Yağı (4L)', 1.0, 1400.00, 1400.00),
        (v_tenant_id, v_workorder_1, 'Labor', 'Ön Fren Balata Değişimi & Kaliper Temizliği', 1.5, 666.67, 1000.00)
    ON CONFLICT DO NOTHING;
END $$;
