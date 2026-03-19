using CVCurator.API.Models;
using CVCurator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CVCurator.API.Controllers;

[ApiController]
[Route("api/skills")]
public class SkillsController : ControllerBase
{
    private readonly IStorageService _storage;

    public SkillsController(IStorageService storage) => _storage = storage;

    [HttpGet]
    public async Task<ActionResult<List<Skill>>> GetAll()
        => Ok(await _storage.GetSkillsAsync());

    [HttpPost]
    public async Task<ActionResult<Skill>> Create([FromBody] Skill skill)
    {
        var created = await _storage.AddSkillAsync(skill);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _storage.DeleteSkillAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
