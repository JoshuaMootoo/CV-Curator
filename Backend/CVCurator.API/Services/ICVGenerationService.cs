using CVCurator.API.Models;

namespace CVCurator.API.Services;

public interface ICVGenerationService
{
    Task<GeneratedCV> GenerateAsync(GenerateCVRequest request);
}
