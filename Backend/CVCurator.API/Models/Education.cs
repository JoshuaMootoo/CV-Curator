namespace CVCurator.API.Models;

public class Education
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Institution { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; } // null = current
    public string? Grade { get; set; }
}
