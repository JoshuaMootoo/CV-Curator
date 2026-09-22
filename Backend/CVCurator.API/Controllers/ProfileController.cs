using CVCurator.API.Models;
using CVCurator.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CVCurator.API.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IStorageService _storage;

    public ProfileController(IStorageService storage) => _storage = storage;

    [HttpGet]
    public async Task<ActionResult<UserProfile>> Get()
    {
        var profile = await _storage.GetProfileAsync();
        if (profile is null) return NotFound("No profile found.");
        return Ok(profile);
    }

    [HttpPost]
    public async Task<ActionResult<UserProfile>> Create([FromBody] UserProfile profile)
    {
        var created = await _storage.UpsertProfileAsync(profile);
        return CreatedAtAction(nameof(Get), created);
    }

    [HttpPut]
    public async Task<ActionResult<UserProfile>> Update([FromBody] UserProfile profile)
    {
        var updated = await _storage.UpsertProfileAsync(profile);
        return Ok(updated);
    }
}
