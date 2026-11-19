using System.Text;
using HiServis.Api.Endpoints;
using HiServis.Api.Middlewares;
using HiServis.Core.Interfaces;
using HiServis.Infrastructure.Data;
using HiServis.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. Dependency Injection - Core & Infrastructure
builder.Services.AddScoped<ITenantContext, TenantContext>();
builder.Services.AddScoped<PostgreSqlRlsInterceptor>();
builder.Services.AddScoped<IPinAuthService, PinAuthService>();
builder.Services.AddSingleton<ITsbVehicleCatalogService, TsbVehicleCatalogService>();
builder.Services.AddScoped<IRegistrationCardOcrService, RegistrationCardOcrService>();

// 2. DbContext with PostgreSQL & RLS Interceptor
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=hiservis_dev;Username=postgres;Password=postgres";

builder.Services.AddDbContext<HiServisDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<PostgreSqlRlsInterceptor>();
    options.UseNpgsql(connectionString)
           .AddInterceptors(interceptor);
});

// 3. Authentication & JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "HiServis_Super_Secret_Key_For_Jwt_Auth_2026_Should_Be_Long_Enough!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HiServis.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HiServis.Clients";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// 4. Custom Middlewares
app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();

// 5. Health & Diagnostic Endpoints
app.MapGet("/api/v1/health", (ITenantContext tenantContext) => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTimeOffset.UtcNow,
    tenantId = tenantContext.TenantId,
    branchId = tenantContext.BranchId,
    isTenantAdmin = tenantContext.IsTenantAdmin,
    version = "1.1.0-faz1"
}))
.WithName("HealthCheck")
.WithTags("System");

// 6. Business Endpoints
app.MapAuthEndpoints();
app.MapWorkOrderEndpoints();
app.MapAssetEndpoints();
app.MapBayEndpoints();
app.MapOcrEndpoints();

app.Run();

public partial class Program { }
