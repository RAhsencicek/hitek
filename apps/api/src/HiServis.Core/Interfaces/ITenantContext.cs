namespace HiServis.Core.Interfaces;

public interface ITenantContext
{
    Guid? TenantId { get; }
    Guid? BranchId { get; }
    Guid? UserId { get; }
    string? UserRole { get; }
    bool IsTenantAdmin { get; }

    void SetContext(Guid tenantId, Guid? branchId, Guid? userId, string? role, bool isTenantAdmin);
}
