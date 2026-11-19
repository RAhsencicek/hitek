using System.Text;
using HiServis.Core.Interfaces;

namespace HiServis.Infrastructure.Services;

public class EscPosLabelService : IEscPosLabelService
{
    public byte[] GenerateEscPosBytes(ThermalLabelModel model)
    {
        using var ms = new MemoryStream();
        using var writer = new BinaryWriter(ms);

        // ESC @: Initialize printer
        writer.Write(new byte[] { 0x1B, 0x40 });

        // ESC a 1: Center align header
        writer.Write(new byte[] { 0x1B, 0x61, 0x01 });

        // ESC E 1: Emphasized/Bold on
        writer.Write(new byte[] { 0x1B, 0x45, 0x01 });
        writer.Write(Encoding.UTF8.GetBytes($"{SanitizeForThermalPrint(model.WorkshopName)} - {SanitizeForThermalPrint(model.BranchName)}\n"));

        // ESC E 0: Bold off
        writer.Write(new byte[] { 0x1B, 0x45, 0x00 });
        writer.Write(Encoding.UTF8.GetBytes("================================\n"));

        // ESC a 0: Left align body
        writer.Write(new byte[] { 0x1B, 0x61, 0x00 });
        writer.Write(Encoding.UTF8.GetBytes($"IS EMRI: #{model.WorkOrderNumber}\n"));
        writer.Write(Encoding.UTF8.GetBytes($"PLAKA:   {model.Plate}\n"));
        writer.Write(Encoding.UTF8.GetBytes($"USTA:    {SanitizeForThermalPrint(model.TechnicianName)} ({SanitizeForThermalPrint(model.BayName)})\n"));
        writer.Write(Encoding.UTF8.GetBytes($"SASE:    {model.Vin}\n"));
        writer.Write(Encoding.UTF8.GetBytes($"PARCA:   {SanitizeForThermalPrint(model.PartName)}\n"));
        writer.Write(Encoding.UTF8.GetBytes($"SKU:     {model.PartSku}\n"));
        writer.Write(Encoding.UTF8.GetBytes($"MUHUR:   {model.SealToken}\n"));
        writer.Write(Encoding.UTF8.GetBytes($"TARIH:   {model.SealedAt:dd.MM.yyyy HH:mm}\n"));
        writer.Write(Encoding.UTF8.GetBytes("--------------------------------\n"));

        // ESC a 1: Center QR Code
        writer.Write(new byte[] { 0x1B, 0x61, 0x01 });

        // QR Code Payload: compact format "HS|Token|Plate|WorkOrder"
        var qrData = Encoding.UTF8.GetBytes($"{model.SealToken}|{model.Plate}|{model.WorkOrderNumber}");

        // GS ( k: Model 2 QR Code
        writer.Write(new byte[] { 0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00 });

        // GS ( k: Module size (5)
        writer.Write(new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x05 });

        // GS ( k: Error correction M (49)
        writer.Write(new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31 });

        // GS ( k: Store QR data
        var storeLen = qrData.Length + 3;
        var pL = (byte)(storeLen % 256);
        var pH = (byte)(storeLen / 256);
        writer.Write(new byte[] { 0x1D, 0x28, 0x6B, pL, pH, 0x31, 0x50, 0x30 });
        writer.Write(qrData);

        // GS ( k: Print QR Code
        writer.Write(new byte[] { 0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30 });

        // Line feeds and partial paper cut
        writer.Write(Encoding.UTF8.GetBytes("\n\n"));
        writer.Write(new byte[] { 0x1D, 0x56, 0x41, 0x00 }); // GS V A (Feed and full cut)

        writer.Flush();
        return ms.ToArray();
    }

    public string GenerateEscPosBase64(ThermalLabelModel model)
    {
        var bytes = GenerateEscPosBytes(model);
        return Convert.ToBase64String(bytes);
    }

    public string GenerateEscPosHex(ThermalLabelModel model)
    {
        var bytes = GenerateEscPosBytes(model);
        return Convert.ToHexString(bytes);
    }

    public string GenerateAsciiLabel(ThermalLabelModel model)
    {
        var sb = new StringBuilder();
        sb.AppendLine("┌────────────────────────────────────────────────────────┐");
        sb.AppendLine($"│  {PadBoth($"{model.WorkshopName}  •  {model.BranchName}", 54)}│");
        sb.AppendLine($"│  İŞ EMRİ: #{PadRight(model.WorkOrderNumber, 44)}│");
        sb.AppendLine($"│  PLAKA: {PadRight(model.Plate, 16)} USTA: {PadRight($"{model.TechnicianName} ({model.BayName})", 25)}│");
        sb.AppendLine($"│  ŞASE:  {PadRight(model.Vin, 46)}│");
        sb.AppendLine($"│  PARÇA: {PadRight($"{model.PartName} ({model.PartSku})", 46)}│");
        sb.AppendLine("│  ┌──────────┐                                          │");
        sb.AppendLine($"│  │ [QR KOD] │  MÜHÜR TOKENI: {PadRight(model.SealToken, 26)}│");
        sb.AppendLine($"│  │          │  TARİH: {PadRight(model.SealedAt.ToString("dd.MM.yyyy HH:mm"), 33)}│");
        sb.AppendLine("│  └──────────┘                                          │");
        sb.AppendLine("└────────────────────────────────────────────────────────┘");
        return sb.ToString();
    }

    private static string PadRight(string? s, int len)
    {
        s ??= "";
        if (s.Length > len) return s.Substring(0, len);
        return s.PadRight(len);
    }

    private static string PadBoth(string? s, int len)
    {
        s ??= "";
        if (s.Length > len) return s.Substring(0, len);
        var totalPad = len - s.Length;
        var padLeft = totalPad / 2;
        return s.PadLeft(s.Length + padLeft).PadRight(len);
    }

    private static string SanitizeForThermalPrint(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return text
            .Replace('ğ', 'g').Replace('Ğ', 'G')
            .Replace('ü', 'u').Replace('Ü', 'U')
            .Replace('ş', 's').Replace('Ş', 'S')
            .Replace('ı', 'i').Replace('İ', 'I')
            .Replace('ö', 'o').Replace('Ö', 'O')
            .Replace('ç', 'c').Replace('Ç', 'C');
    }
}
