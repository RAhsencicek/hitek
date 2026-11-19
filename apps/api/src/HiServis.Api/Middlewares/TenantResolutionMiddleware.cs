using System.Security.Claims;
using HiServis.Core.Interfaces;

namespace HiServis.Api.Middlewares;

public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        // 1. Try resolving from Authenticated JWT Claims
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
            var branchClaim = context.User.FindFirst("branch_id")?.Value;
            var userClaim = context.User.FindFirst("user_id")?.Value;
            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
            var adminClaim = context.User.FindFirst("is_tenant_admin")?.Value;

            if (Guid.TryParse(tenantClaim, out var tenantId))
            {
                Guid.TryParse(branchClaim, out var branchId);
                Guid.TryParse(userClaim, out var userId);
                var isAdmin = adminClaim?.Equals("true", StringComparison.OrdinalIgnoreCase) == true;

                tenantContext.SetContext(
                    tenantId,
                    branchId == Guid.Empty ? null : branchId,
                    userId == Guid.Empty ? null : userId,
                    roleClaim,
                    isAdmin
                );
            }
        }
        else
        {
            // 2. Fallback to developer / gateway headers if provided
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader) &&
                Guid.TryParse(tenantHeader.ToString(), out var tenantId))
            {
                Guid? branchId = null;
                if (context.Request.Headers.TryGetValue("X-Branch-Id", out var branchHeader) &&
                    Guid.TryParse(branchHeader.ToString(), out var bId))
                {
                    branchId = bId;
                }

                var isAdmin = context.Request.Headers.TryGetValue("X-Is-Tenant-Admin", out var adminHeader) &&
                              adminHeader.ToString().Equals("true", StringComparison.OrdinalIgnoreCase);

                tenantContext.SetContext(tenantId, branchId, null, "AnonymousGateway", isAdmin);
            }
            else
            {
                // Development / Demo Fallback to default tenant
                var defaultTenant = Guid.Parse("11111111-1111-1111-1111-111111111111");
                var defaultBranch = Guid.Parse("22222222-2222-2222-2222-222222222222");
                tenantContext.SetContext(defaultTenant, defaultBranch, null, "DevDefault", isTenantAdmin: true);
            }
        }

        await _next(context);
    }
}
