using HiServis.Core.DTOs;

namespace HiServis.Core.Interfaces;

public interface IPinAuthService
{
    Task<AuthResult> LoginWithPinAsync(PinLoginRequest request, CancellationToken cancellationToken = default);
    string HashPin(string pin);
    bool VerifyPin(string pin, string hash);
}
