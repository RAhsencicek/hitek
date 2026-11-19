using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HiServis.Core.DTOs;
using HiServis.Core.Enums;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HiServis.Infrastructure.Services;

public class PinAuthService : IPinAuthService
{
    private readonly HiServisDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public PinAuthService(HiServisDbContext dbContext, IConfiguration configuration)
    {
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<AuthResult> LoginWithPinAsync(PinLoginRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedPhone = request.Phone.Trim().Replace(" ", "").Replace("-", "");

        Core.Entities.User? user = null;

        if (_dbContext.Database.IsRelational())
        {
            await using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
            await _dbContext.Database.ExecuteSqlRawAsync(
                "SELECT set_config('app.is_auth_lookup', 'true', true);",
                cancellationToken);

            user = await _dbContext.Users
                .IgnoreQueryFilters()
                .Include(u => u.Tenant)
                .Include(u => u.Branch)
                .FirstOrDefaultAsync(u => u.Phone.Replace(" ", "").Replace("-", "") == normalizedPhone && u.IsActive, cancellationToken);

            await tx.CommitAsync(cancellationToken);
        }
        else
        {
            user = await _dbContext.Users
                .IgnoreQueryFilters()
                .Include(u => u.Tenant)
                .Include(u => u.Branch)
                .FirstOrDefaultAsync(u => u.Phone.Replace(" ", "").Replace("-", "") == normalizedPhone && u.IsActive, cancellationToken);
        }

        if (user == null)
        {
            return new AuthResult(false, null, "Kullanıcı veya telefon numarası bulunamadı.");
        }

        if (!VerifyPin(request.Pin, user.PinHash))
        {
            return new AuthResult(false, null, "Hatalı PIN kodu.");
        }

        var branchId = request.PreferredBranchId ?? user.BranchId;
        var token = GenerateJwtToken(user, branchId);

        return new AuthResult(
            Success: true,
            Token: token,
            ErrorMessage: null,
            TenantId: user.TenantId,
            BranchId: branchId,
            UserId: user.Id,
            FullName: user.FullName,
            Role: user.Role.ToString()
        );
    }

    public string HashPin(string pin)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(pin + "_hiservis_salt_2026"));
        return Convert.ToHexString(hashedBytes).ToLowerInvariant();
    }

    public bool VerifyPin(string pin, string hash)
    {
        if (string.IsNullOrWhiteSpace(pin) || string.IsNullOrWhiteSpace(hash))
        {
            return false;
        }

        var computed = HashPin(pin);
        if (string.Equals(computed, hash, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        // Defensive compatibility check for un-salted SHA256 placeholder hashes in development
        using var sha256 = SHA256.Create();
        var plainBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(pin));
        var plainHex = Convert.ToHexString(plainBytes).ToLowerInvariant();
        return string.Equals(plainHex, hash, StringComparison.OrdinalIgnoreCase);
    }

    private string GenerateJwtToken(Core.Entities.User user, Guid branchId)
    {
        var secret = _configuration["Jwt:Secret"] ?? "HiServis_Super_Secret_Key_For_Jwt_Auth_2026_Should_Be_Long_Enough!";
        var issuer = _configuration["Jwt:Issuer"] ?? "HiServis.Api";
        var audience = _configuration["Jwt:Audience"] ?? "HiServis.Clients";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var isTenantAdmin = user.Role == UserRole.Owner;

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.FullName),
            new Claim("tenant_id", user.TenantId.ToString()),
            new Claim("branch_id", branchId.ToString()),
            new Claim("user_id", user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("is_tenant_admin", isTenantAdmin ? "true" : "false")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7), // Rapid reconnect for workshop devices
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
