using HiServis.Core.Entities;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HiServis.Infrastructure.Data;

public class HiServisDbContext : DbContext
{
    private readonly ITenantContext? _tenantContext;

    public HiServisDbContext(DbContextOptions<HiServisDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderLine> PurchaseOrderLines => Set<PurchaseOrderLine>();
    public DbSet<WorkOrder> WorkOrders => Set<WorkOrder>();
    public DbSet<WorkOrderLine> WorkOrderLines => Set<WorkOrderLine>();
    public DbSet<WorkOrderPartRequest> WorkOrderPartRequests => Set<WorkOrderPartRequest>();
    public DbSet<QuarantineIncident> QuarantineIncidents => Set<QuarantineIncident>();
    public DbSet<OutboxEvent> OutboxEvents => Set<OutboxEvent>();
    public DbSet<WorkshopBay> WorkshopBays => Set<WorkshopBay>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Table Names to match PostgreSQL 17 DDL
        modelBuilder.Entity<Tenant>().ToTable("tenants");
        modelBuilder.Entity<Branch>().ToTable("branches");
        modelBuilder.Entity<User>().ToTable("users");
        modelBuilder.Entity<Warehouse>().ToTable("warehouses");
        modelBuilder.Entity<Asset>().ToTable("assets");
        modelBuilder.Entity<PurchaseOrder>().ToTable("purchaseorders");
        modelBuilder.Entity<PurchaseOrderLine>().ToTable("purchaseorderlines");
        modelBuilder.Entity<WorkOrder>().ToTable("workorders");
        modelBuilder.Entity<WorkOrderLine>().ToTable("workorderlines");
        modelBuilder.Entity<WorkOrderPartRequest>().ToTable("workorderpartrequests");
        modelBuilder.Entity<QuarantineIncident>().ToTable("quarantineincidents");
        modelBuilder.Entity<OutboxEvent>().ToTable("outboxevents");
        modelBuilder.Entity<WorkshopBay>().ToTable("workshopbays");

        // Explicit column mappings for JSON and naming differences
        modelBuilder.Entity<Asset>()
            .Property(a => a.DynamicAttributesJson)
            .HasColumnName("dynamicattributes")
            .HasColumnType("jsonb");

        modelBuilder.Entity<QuarantineIncident>()
            .Property(q => q.ServerStateJson)
            .HasColumnName("serverstate")
            .HasColumnType("jsonb");

        modelBuilder.Entity<QuarantineIncident>()
            .Property(q => q.ClientStateJson)
            .HasColumnName("clientstate")
            .HasColumnType("jsonb");

        modelBuilder.Entity<OutboxEvent>()
            .Property(o => o.PayloadJson)
            .HasColumnName("payload")
            .HasColumnType("jsonb");

        modelBuilder.Entity<WorkOrder>()
            .Property(w => w.DamageMarkersJson)
            .HasColumnName("damagemarkersjson")
            .HasColumnType("jsonb");

        // Independent relationships between WorkOrder and WorkshopBay
        modelBuilder.Entity<WorkOrder>()
            .HasOne(w => w.Bay)
            .WithMany()
            .HasForeignKey(w => w.BayId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkshopBay>()
            .HasOne(b => b.CurrentWorkOrder)
            .WithMany()
            .HasForeignKey(b => b.CurrentWorkOrderId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<WorkshopBay>()
            .HasOne(b => b.AssignedTechnician)
            .WithMany()
            .HasForeignKey(b => b.AssignedTechnicianId)
            .OnDelete(DeleteBehavior.SetNull);

        // Convert all column names to lowercase to match PostgreSQL 17 unquoted DDL
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            var tableName = entity.GetTableName();
            if (tableName != null)
            {
                entity.SetTableName(tableName.ToLowerInvariant());
            }

            foreach (var property in entity.GetProperties())
            {
                var colName = property.GetColumnName();
                if (!string.IsNullOrEmpty(colName))
                {
                    property.SetColumnName(colName.ToLowerInvariant());
                }
            }
        }

        // Indexes
        modelBuilder.Entity<Asset>()
            .HasIndex(a => new { a.TenantId, a.PrimaryIdentifier })
            .HasDatabaseName("idx_assets_tenant_plate");

        modelBuilder.Entity<WorkOrder>()
            .HasIndex(w => new { w.TenantId, w.BranchId })
            .HasDatabaseName("idx_workorders_tenant_branch");

        // Enums as string conversions with QUARANTINE_REVIEW mapping per spec
        modelBuilder.Entity<WorkOrder>()
            .Property(w => w.Status)
            .HasConversion(
                v => v == WorkOrderStatus.QuarantineReview ? "QUARANTINE_REVIEW" : v.ToString(),
                v => v.Equals("QUARANTINE_REVIEW", StringComparison.OrdinalIgnoreCase) || v.Equals("QuarantineReview", StringComparison.OrdinalIgnoreCase)
                    ? WorkOrderStatus.QuarantineReview
                    : Enum.Parse<WorkOrderStatus>(v, true)
            );

        modelBuilder.Entity<User>()
            .Property(u => u.Role)
            .HasConversion<string>();

        modelBuilder.Entity<Warehouse>()
            .Property(w => w.WarehouseType)
            .HasConversion<string>();

        modelBuilder.Entity<PurchaseOrder>()
            .Property(p => p.Status)
            .HasConversion<string>();

        // Decimal precisions
        modelBuilder.Entity<WorkOrder>().Property(w => w.GrandTotal).HasPrecision(15, 2);
        modelBuilder.Entity<WorkOrder>().Property(w => w.PaidAmount).HasPrecision(15, 2);
        modelBuilder.Entity<WorkOrder>().Property(w => w.RemainingBalance).HasPrecision(15, 2);
        modelBuilder.Entity<WorkOrderLine>().Property(l => l.UnitPrice).HasPrecision(12, 2);
        modelBuilder.Entity<WorkOrderLine>().Property(l => l.TotalAmount).HasPrecision(12, 2);
        modelBuilder.Entity<PurchaseOrder>().Property(p => p.TotalAmount).HasPrecision(15, 2);
        modelBuilder.Entity<PurchaseOrderLine>().Property(l => l.UnitPrice).HasPrecision(12, 2);

        // Defense-in-depth Query Filters (Application level + DB RLS level)
        if (_tenantContext != null)
        {
            modelBuilder.Entity<Branch>().HasQueryFilter(b => _tenantContext.TenantId == null || b.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Asset>().HasQueryFilter(a => _tenantContext.TenantId == null || a.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<WorkOrder>().HasQueryFilter(w => 
                _tenantContext.TenantId == null || 
                (w.TenantId == _tenantContext.TenantId && (_tenantContext.IsTenantAdmin || _tenantContext.BranchId == null || w.BranchId == _tenantContext.BranchId))
            );
            modelBuilder.Entity<WorkOrderLine>().HasQueryFilter(l => _tenantContext.TenantId == null || l.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<WorkOrderPartRequest>().HasQueryFilter(p => _tenantContext.TenantId == null || p.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<PurchaseOrderLine>().HasQueryFilter(l => _tenantContext.TenantId == null || l.TenantId == _tenantContext.TenantId);
            modelBuilder.Entity<Warehouse>().HasQueryFilter(w => 
                _tenantContext.TenantId == null || 
                (w.TenantId == _tenantContext.TenantId && (_tenantContext.IsTenantAdmin || _tenantContext.BranchId == null || w.BranchId == _tenantContext.BranchId))
            );
            modelBuilder.Entity<PurchaseOrder>().HasQueryFilter(p => 
                _tenantContext.TenantId == null || 
                (p.TenantId == _tenantContext.TenantId && (_tenantContext.IsTenantAdmin || _tenantContext.BranchId == null || p.BranchId == _tenantContext.BranchId))
            );
            modelBuilder.Entity<WorkshopBay>().HasQueryFilter(b => 
                _tenantContext.TenantId == null || 
                (b.TenantId == _tenantContext.TenantId && (_tenantContext.IsTenantAdmin || _tenantContext.BranchId == null || b.BranchId == _tenantContext.BranchId))
            );
        }
    }
}
