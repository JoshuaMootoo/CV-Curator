using CVCurator.API.Models;
using CVCurator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CVCurator.API.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IStorageService _storage;

    public ProjectsController(IStorageService storage) => _storage = storage;

    [HttpGet]
    public async Task<ActionResult<List<Project>>> GetAll()
        => Ok(await _storage.GetProjectsAsync());

    [HttpPost]
    public async Task<ActionResult<Project>> Create([FromBody] Project project)
    {
        var created = await _storage.AddProjectAsync(project);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Project>> Update(string id, [FromBody] Project project)
    {
        var updated = await _storage.UpdateProjectAsync(id, project);
        if (updated is null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _storage.DeleteProjectAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
