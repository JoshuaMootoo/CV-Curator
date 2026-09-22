namespace CVCurator.API.Models;

public class Project
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> TechStack { get; set; } = new();
    public string? Link { get; set; }
}
