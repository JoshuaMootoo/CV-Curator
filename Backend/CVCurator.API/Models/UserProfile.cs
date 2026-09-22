namespace CVCurator.API.Models;

public class UserProfile
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public ProfileLinks Links { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}

public class ProfileLinks
{
    public string? GitHub { get; set; }
    public string? Portfolio { get; set; }
    public string? LinkedIn { get; set; }
}
