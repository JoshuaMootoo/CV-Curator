using CVCurator.API.Models;
using CVCurator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CVCurator.API.Controllers;

[ApiController]
[Route("api/education")]
public class EducationController : ControllerBase
{
    private readonly IStorageService _storage;

    public EducationController(IStorageService storage) => _storage = storage;

    [HttpGet]
    public async Task<ActionResult<List<Education>>> GetAll()
        => Ok(await _storage.GetEducationAsync());

    [HttpPost]
    public async Task<ActionResult<Education>> Create([FromBody] Education education)
    {
        var created = await _storage.AddEducationAsync(education);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Education>> Update(string id, [FromBody] Education education)
    {
        var updated = await _storage.UpdateEducationAsync(id, education);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _storage.DeleteEducationAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
