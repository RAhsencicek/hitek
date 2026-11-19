using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;
using HiServis.Core.Interfaces;
using Npgsql;

namespace HiServis.Infrastructure.Data;

/// <summary>
/// PostgreSQL 17 Session Context Interceptor for Row-Level Security (RLS).
/// Automatically configures app.current_tenant_id, app.current_branch_id, and app.is_tenant_admin
/// on every opened connection according to the current request's ITenantContext using parameterized
/// set_config calls to guarantee session persistence across pooled connections and prevent SQL injection.
/// </summary>
public class PostgreSqlRlsInterceptor : DbConnectionInterceptor
{
    private readonly ITenantContext _tenantContext;

    public PostgreSqlRlsInterceptor(ITenantContext tenantContext)
    {
        _tenantContext = tenantContext;
    }

    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        SetSessionVariables(connection);
        base.ConnectionOpened(connection, eventData);
    }

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        await SetSessionVariablesAsync(connection, cancellationToken);
        await base.ConnectionOpenedAsync(connection, eventData, cancellationToken);
    }

    public override InterceptionResult ConnectionClosing(
        DbConnection connection,
        ConnectionEventData eventData,
        InterceptionResult result)
    {
        ClearSessionVariables(connection);
        return base.ConnectionClosing(connection, eventData, result);
    }

    public override async ValueTask<InterceptionResult> ConnectionClosingAsync(
        DbConnection connection,
        ConnectionEventData eventData,
        InterceptionResult result)
    {
        await ClearSessionVariablesAsync(connection);
        return await base.ConnectionClosingAsync(connection, eventData, result);
    }

    private void SetSessionVariables(DbConnection connection)
    {
        if (connection.State != System.Data.ConnectionState.Open) return;

        using var cmd = connection.CreateCommand();
        ConfigureCommand(cmd);
        cmd.ExecuteNonQuery();
    }

    private async Task SetSessionVariablesAsync(DbConnection connection, CancellationToken cancellationToken)
    {
        if (connection.State != System.Data.ConnectionState.Open) return;

        await using var cmd = connection.CreateCommand();
        ConfigureCommand(cmd);
        await cmd.ExecuteNonQueryAsync(cancellationToken);
    }

    private void ClearSessionVariables(DbConnection connection)
    {
        if (connection.State != System.Data.ConnectionState.Open) return;

        try
        {
            using var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT set_config('app.current_tenant_id', '', false), set_config('app.current_branch_id', '', false), set_config('app.is_tenant_admin', 'false', false), set_config('app.current_user_id', '', false);";
            cmd.ExecuteNonQuery();
        }
        catch
        {
            // Suppress error if connection is broken during closing
        }
    }

    private async Task ClearSessionVariablesAsync(DbConnection connection)
    {
        if (connection.State != System.Data.ConnectionState.Open) return;

        try
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = "SELECT set_config('app.current_tenant_id', '', false), set_config('app.current_branch_id', '', false), set_config('app.is_tenant_admin', 'false', false), set_config('app.current_user_id', '', false);";
            await cmd.ExecuteNonQueryAsync();
        }
        catch
        {
            // Suppress error if connection is broken during closing
        }
    }

    private void ConfigureCommand(DbCommand cmd)
    {
        var tenantId = _tenantContext.TenantId?.ToString() ?? string.Empty;
        var branchId = _tenantContext.BranchId?.ToString() ?? string.Empty;
        var isAdmin = _tenantContext.IsTenantAdmin ? "true" : "false";
        var userId = _tenantContext.UserId?.ToString() ?? string.Empty;

        cmd.CommandText = "SELECT set_config('app.current_tenant_id', @tenantId, false), " +
                          "set_config('app.current_branch_id', @branchId, false), " +
                          "set_config('app.is_tenant_admin', @isAdmin, false), " +
                          "set_config('app.current_user_id', @userId, false);";

        AddParameter(cmd, "@tenantId", tenantId);
        AddParameter(cmd, "@branchId", branchId);
        AddParameter(cmd, "@isAdmin", isAdmin);
        AddParameter(cmd, "@userId", userId);
    }

    private static void AddParameter(DbCommand cmd, string name, string value)
    {
        var param = cmd.CreateParameter();
        param.ParameterName = name;
        param.Value = value;
        cmd.Parameters.Add(param);
    }

    public string BuildSetCommandText()
    {
        var tenantId = _tenantContext.TenantId?.ToString() ?? string.Empty;
        var branchId = _tenantContext.BranchId?.ToString() ?? string.Empty;
        var isAdmin = _tenantContext.IsTenantAdmin ? "true" : "false";
        var userId = _tenantContext.UserId?.ToString() ?? string.Empty;

        return $"SELECT set_config('app.current_tenant_id', '{tenantId}', false), " +
               $"set_config('app.current_branch_id', '{branchId}', false), " +
               $"set_config('app.is_tenant_admin', '{isAdmin}', false), " +
               $"set_config('app.current_user_id', '{userId}', false);";
    }
}
