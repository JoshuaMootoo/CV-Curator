namespace CVCurator.API.Models;

public class GenerateCVRequest
{
    public string JobDescription { get; set; } = string.Empty;
    /// <summary>Max work experience entries to include</summary>
    public int MaxExperience { get; set; } = 5;
    /// <summary>Max project entries to include</summary>
    public int MaxProjects { get; set; } = 4;
}

public class GeneratedCV
{
    public PersonalInfo PersonalInfo { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
    public List<ScoredExperience> Experience { get; set; } = new();
    public List<ScoredProject> Projects { get; set; } = new();
    public List<Education> Education { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    /// <summary>Plain text formatted version of the CV</summary>
    public string FormattedText { get; set; } = string.Empty;
    /// <summary>Keywords extracted from the job description</summary>
    public List<string> ExtractedKeywords { get; set; } = new();
}

public class PersonalInfo
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public ProfileLinks Links { get; set; } = new();
}

/// <summary>Work experience entry with relevance score attached</summary>
public class ScoredExperience
{
    public string Id { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    /// <summary>Bullet points reordered so relevant ones appear first</summary>
    public List<string> BulletPoints { get; set; } = new();
    public List<string> Skills { get; set; } = new();
    public double RelevanceScore { get; set; }
}

/// <summary>Project entry with relevance score attached</summary>
public class ScoredProject
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> TechStack { get; set; } = new();
    public string? Link { get; set; }
    public double RelevanceScore { get; set; }
}
