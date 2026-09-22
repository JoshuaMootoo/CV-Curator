using CVCurator.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CV Curator API", Version = "v1" });
});

// ─── Core services ───────────────────────────────────────────────────────────
// To swap storage backends later, change only these two lines:
builder.Services.AddSingleton<IStorageService, InMemoryStorageService>();
builder.Services.AddSingleton<IKeywordExtractionService, KeywordExtractionService>();
builder.Services.AddScoped<ICVGenerationService, CVGenerationService>();

// ─── CORS: allow the Next.js dev server ──────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");
app.UseAuthorization();
app.MapControllers();

app.Run();

// Make Program accessible from test projects
public partial class Program { }
