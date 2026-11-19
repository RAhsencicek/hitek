using HiServis.Infrastructure.Data;
using HiServis.Infrastructure.Services;
using Xunit;

namespace HiServis.Tests;

public class RlsInterceptorTests
{
    [Fact]
    public void BuildSetCommandText_WithTenantAndBranch_GeneratesValidSql()
    {
        var tenantContext = new TenantContext();
        var tenantId = Guid.NewGuid();
        var branchId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        tenantContext.SetContext(tenantId, branchId, userId, "Technician", isTenantAdmin: false);

        var interceptor = new PostgreSqlRlsInterceptor(tenantContext);
        var sql = interceptor.BuildSetCommandText();

        Assert.Contains($"set_config('app.current_tenant_id', '{tenantId}', false)", sql);
        Assert.Contains($"set_config('app.current_branch_id', '{branchId}', false)", sql);
        Assert.Contains("set_config('app.is_tenant_admin', 'false', false)", sql);
        Assert.Contains($"set_config('app.current_user_id', '{userId}', false)", sql);
    }

    [Fact]
    public void BuildSetCommandText_ForTenantAdmin_SetsIsTenantAdminTrue()
    {
        var tenantContext = new TenantContext();
        var tenantId = Guid.NewGuid();

        tenantContext.SetContext(tenantId, null, null, "Owner", isTenantAdmin: true);

        var interceptor = new PostgreSqlRlsInterceptor(tenantContext);
        var sql = interceptor.BuildSetCommandText();

        Assert.Contains($"set_config('app.current_tenant_id', '{tenantId}', false)", sql);
        Assert.Contains("set_config('app.is_tenant_admin', 'true', false)", sql);
    }
}
