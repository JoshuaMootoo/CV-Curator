namespace CVCurator.API.Models;

public class WorkExperience
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; } // null = current
    public List<string> BulletPoints { get; set; } = new();
    public List<string> Skills { get; set; } = new();
}
