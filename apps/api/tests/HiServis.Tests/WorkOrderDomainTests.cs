using HiServis.Core.Entities;
using HiServis.Core.Enums;
using Xunit;

namespace HiServis.Tests;

public class WorkOrderDomainTests
{
    [Fact]
    public void WorkOrder_Initialization_HasCorrectDefaults()
    {
        var tenantId = Guid.NewGuid();
        var branchId = Guid.NewGuid();
        var assetId = Guid.NewGuid();

        var wo = new WorkOrder
        {
            TenantId = tenantId,
            BranchId = branchId,
            AssetId = assetId,
            WorkOrderNumber = "WO-2026-0001",
            CustomerName = "Ahmet Yılmaz",
            CustomerPhone = "05321112233",
            IntakeMeter = 120000
        };

        Assert.Equal(WorkOrderStatus.Open, wo.Status);
        Assert.Equal(0.00m, wo.GrandTotal);
        Assert.Equal(0.00m, wo.PaidAmount);
        Assert.Equal("NotSynced", wo.ErpSyncStatus);
        Assert.True(wo.HlcTimestamp > 0);
    }

    [Theory]
    [InlineData(WorkOrderStatus.Open)]
    [InlineData(WorkOrderStatus.InProgress)]
    [InlineData(WorkOrderStatus.WaitingParts)]
    [InlineData(WorkOrderStatus.CustomerApproval)]
    [InlineData(WorkOrderStatus.Completed)]
    [InlineData(WorkOrderStatus.Invoiced)]
    [InlineData(WorkOrderStatus.Cancelled)]
    [InlineData(WorkOrderStatus.QuarantineReview)]
    public void WorkOrderStatus_AllStatusTransitions_AreDefined(WorkOrderStatus status)
    {
        var wo = new WorkOrder { Status = status };
        Assert.Equal(status, wo.Status);
    }

    [Fact]
    public void OutboxEvent_PayloadAndTimestamp_AreStoredProperly()
    {
        var tenantId = Guid.NewGuid();
        var aggregateId = Guid.NewGuid();

        var outbox = new OutboxEvent
        {
            TenantId = tenantId,
            AggregateType = "WorkOrder",
            AggregateId = aggregateId,
            EventType = "WorkOrderCompletedEvent",
            PayloadJson = "{\"status\":\"Completed\"}"
        };

        Assert.Equal(0, outbox.RetryCount);
        Assert.Null(outbox.ProcessedAt);
        Assert.Equal("WorkOrder", outbox.AggregateType);
        Assert.Contains("Completed", outbox.PayloadJson);
    }
}
