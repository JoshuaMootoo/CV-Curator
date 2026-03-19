namespace CVCurator.API.Models;

public class Skill
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
}
