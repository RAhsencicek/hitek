using HiServis.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace HiServis.Tests;

public class PinAuthServiceTests
{
    private readonly PinAuthService _authService;

    public PinAuthServiceTests()
    {
        var config = new ConfigurationBuilder().Build();
        // Pass null for DbContext when testing pure crypto hashing methods
        _authService = new PinAuthService(null!, config);
    }

    [Theory]
    [InlineData("1234")]
    [InlineData("0000")]
    [InlineData("9876")]
    [InlineData("5555")]
    public void HashPin_ShouldProduceConsistentHash(string pin)
    {
        var hash1 = _authService.HashPin(pin);
        var hash2 = _authService.HashPin(pin);

        Assert.NotNull(hash1);
        Assert.Equal(64, hash1.Length); // SHA256 hex string length
        Assert.Equal(hash1, hash2);
    }

    [Fact]
    public void VerifyPin_WithCorrectPin_ShouldReturnTrue()
    {
        var pin = "1234";
        var hash = _authService.HashPin(pin);

        var isValid = _authService.VerifyPin(pin, hash);

        Assert.True(isValid);
    }

    [Theory]
    [InlineData("1235")]
    [InlineData("0000")]
    [InlineData("4321")]
    [InlineData("")]
    public void VerifyPin_WithIncorrectPin_ShouldReturnFalse(string wrongPin)
    {
        var realPin = "1234";
        var hash = _authService.HashPin(realPin);

        var isValid = _authService.VerifyPin(wrongPin, hash);

        Assert.False(isValid);
    }
}
