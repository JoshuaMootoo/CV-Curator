using CVCurator.API.Models;
using CVCurator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CVCurator.API.Controllers;

[ApiController]
[Route("api/experience")]
public class ExperienceController : ControllerBase
{
    private readonly IStorageService _storage;

    public ExperienceController(IStorageService storage) => _storage = storage;

    [HttpGet]
    public async Task<ActionResult<List<WorkExperience>>> GetAll()
        => Ok(await _storage.GetExperienceAsync());

    [HttpPost]
    public async Task<ActionResult<WorkExperience>> Create([FromBody] WorkExperience experience)
    {
        var created = await _storage.AddExperienceAsync(experience);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<WorkExperience>> Update(string id, [FromBody] WorkExperience experience)
    {
        var updated = await _storage.UpdateExperienceAsync(id, experience);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _storage.DeleteExperienceAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
