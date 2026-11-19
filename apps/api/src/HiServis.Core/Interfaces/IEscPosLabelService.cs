namespace HiServis.Core.Interfaces;

public record ThermalLabelModel(
    string WorkshopName,
    string BranchName,
    string WorkOrderNumber,
    string Plate,
    string Vin,
    string TechnicianName,
    string BayName,
    string PartName,
    string PartSku,
    string SealToken,
    DateTimeOffset SealedAt
);

public interface IEscPosLabelService
{
    byte[] GenerateEscPosBytes(ThermalLabelModel model);
    string GenerateEscPosBase64(ThermalLabelModel model);
    string GenerateEscPosHex(ThermalLabelModel model);
    string GenerateAsciiLabel(ThermalLabelModel model);
}
