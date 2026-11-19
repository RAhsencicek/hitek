using HiServis.Core.Interfaces;

namespace HiServis.Infrastructure.Services;

public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; private set; }
    public Guid? BranchId { get; private set; }
    public Guid? UserId { get; private set; }
    public string? UserRole { get; private set; }
    public bool IsTenantAdmin { get; private set; }

    public void SetContext(Guid tenantId, Guid? branchId, Guid? userId, string? role, bool isTenantAdmin)
    {
        TenantId = tenantId;
        BranchId = branchId;
        UserId = userId;
        UserRole = role;
        IsTenantAdmin = isTenantAdmin;
    }
}
