using HiServis.Core.DTOs;

namespace HiServis.Core.Interfaces;

public interface IRegistrationCardOcrService
{
    Task<RegistrationCardOcrResult> ProcessRegistrationCardAsync(RegistrationCardOcrRequest request, CancellationToken ct = default);
}
