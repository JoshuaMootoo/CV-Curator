using CVCurator.API.Models;
using CVCurator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CVCurator.API.Controllers;

[ApiController]
[Route("api/generate-cv")]
public class CVGenerationController : ControllerBase
{
    private readonly ICVGenerationService _cvGenerationService;

    public CVGenerationController(ICVGenerationService cvGenerationService)
        => _cvGenerationService = cvGenerationService;

    /// <summary>
    /// POST /api/generate-cv
    /// Accepts a job description and returns a tailored CV structured object
    /// plus a plain-text formatted version.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<GeneratedCV>> Generate([FromBody] GenerateCVRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.JobDescription))
            return BadRequest("Job description cannot be empty.");

        try
        {
            var cv = await _cvGenerationService.GenerateAsync(request);
            return Ok(cv);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
