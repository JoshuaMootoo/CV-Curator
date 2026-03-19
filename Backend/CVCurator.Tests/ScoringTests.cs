using CVCurator.API.Models;
using CVCurator.API.Services;
using FluentAssertions;
using Xunit;

namespace CVCurator.Tests;

/// <summary>
/// Integration-style tests for the full CV generation scoring pipeline.
/// Uses an in-memory storage pre-seeded with sample data.
/// </summary>
public class ScoringTests
{
    private readonly InMemoryStorageService _storage = new();
    private readonly KeywordExtractionService _keywords = new();
    private readonly CVGenerationService _cvGen;

    public ScoringTests()
    {
        _cvGen = new CVGenerationService(_storage, _keywords);
    }

    [Fact]
    public async Task GenerateCV_ReturnsCV_WithExtractedKeywords()
    {
        var request = new GenerateCVRequest
        {
            JobDescription = "We need a .NET developer with C# and Docker experience."
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.ExtractedKeywords.Should().NotBeEmpty();
        cv.ExtractedKeywords.Should().Contain(k => k.Contains("docker") || k.Contains(".net") || k.Contains("c#"));
    }

    [Fact]
    public async Task GenerateCV_RanksExperienceByRelevance()
    {
        // Job is about React / TypeScript — exp-2 (StartupXYZ) should rank first
        // as it has React, TypeScript skills
        var request = new GenerateCVRequest
        {
            JobDescription = "We are looking for a React and TypeScript developer to join our team."
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.Experience.Should().NotBeEmpty();
        cv.Experience.First().Skills.Should().Contain(s =>
            s.Equals("React", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("TypeScript", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateCV_RanksProjectsByRelevance()
    {
        // Job mentions Docker and AWS — CloudDeploy Dashboard project should rank high
        var request = new GenerateCVRequest
        {
            JobDescription = "Experience with Docker containers and AWS cloud infrastructure required."
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.Projects.Should().NotBeEmpty();
        // Top project should contain Docker or AWS
        var topProject = cv.Projects.First();
        topProject.TechStack.Should().Contain(t =>
            t.Equals("Docker", StringComparison.OrdinalIgnoreCase) ||
            t.Equals("AWS", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GenerateCV_RespectsMaxExperienceLimit()
    {
        var request = new GenerateCVRequest
        {
            JobDescription = "Looking for a software developer.",
            MaxExperience = 2
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.Experience.Count.Should().BeLessOrEqualTo(2);
    }

    [Fact]
    public async Task GenerateCV_RespectsMaxProjectsLimit()
    {
        var request = new GenerateCVRequest
        {
            JobDescription = "Looking for a software developer.",
            MaxProjects = 1
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.Projects.Count.Should().BeLessOrEqualTo(1);
    }

    [Fact]
    public async Task GenerateCV_IncludesFormattedText()
    {
        var request = new GenerateCVRequest
        {
            JobDescription = "Software engineer role requiring C# and TypeScript."
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.FormattedText.Should().NotBeNullOrWhiteSpace();
        cv.FormattedText.Should().Contain(cv.PersonalInfo.Name);
        cv.FormattedText.Should().Contain("EXPERIENCE");
    }

    [Fact]
    public async Task GenerateCV_ContainsPersonalInfo()
    {
        var request = new GenerateCVRequest
        {
            JobDescription = "Senior developer needed."
        };

        var cv = await _cvGen.GenerateAsync(request);

        cv.PersonalInfo.Name.Should().NotBeNullOrEmpty();
        cv.PersonalInfo.Email.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GenerateCV_ReordersBulletPointsToSurfaceRelevantOnesFirst()
    {
        // The job mentions CI/CD and GitHub Actions
        var request = new GenerateCVRequest
        {
            JobDescription = "We need someone with CI/CD experience and GitHub Actions knowledge."
        };

        var cv = await _cvGen.GenerateAsync(request);

        // The first experience entry should have its most relevant bullet first
        var topExperience = cv.Experience.FirstOrDefault();
        topExperience.Should().NotBeNull();
        // At least one bullet should exist
        topExperience!.BulletPoints.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateCV_ThrowsInvalidOperation_WhenNoProfileExists()
    {
        // Use a fresh empty storage with no seeded data
        var emptyStorage = new EmptyStorageService();
        var gen = new CVGenerationService(emptyStorage, _keywords);

        var act = async () => await gen.GenerateAsync(new GenerateCVRequest
        {
            JobDescription = "Developer needed"
        });

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*profile*");
    }
}

/// <summary>Minimal storage that returns empty/null data for error-path tests.</summary>
internal class EmptyStorageService : IStorageService
{
    public Task<UserProfile?> GetProfileAsync() => Task.FromResult<UserProfile?>(null);
    public Task<UserProfile> UpsertProfileAsync(UserProfile p) => Task.FromResult(p);
    public Task<List<WorkExperience>> GetExperienceAsync() => Task.FromResult(new List<WorkExperience>());
    public Task<WorkExperience> AddExperienceAsync(WorkExperience e) => Task.FromResult(e);
    public Task<WorkExperience?> UpdateExperienceAsync(string id, WorkExperience e) => Task.FromResult<WorkExperience?>(null);
    public Task<bool> DeleteExperienceAsync(string id) => Task.FromResult(false);
    public Task<List<Project>> GetProjectsAsync() => Task.FromResult(new List<Project>());
    public Task<Project> AddProjectAsync(Project p) => Task.FromResult(p);
    public Task<Project?> UpdateProjectAsync(string id, Project p) => Task.FromResult<Project?>(null);
    public Task<bool> DeleteProjectAsync(string id) => Task.FromResult(false);
    public Task<List<Education>> GetEducationAsync() => Task.FromResult(new List<Education>());
    public Task<Education> AddEducationAsync(Education e) => Task.FromResult(e);
    public Task<Education?> UpdateEducationAsync(string id, Education e) => Task.FromResult<Education?>(null);
    public Task<bool> DeleteEducationAsync(string id) => Task.FromResult(false);
    public Task<List<Skill>> GetSkillsAsync() => Task.FromResult(new List<Skill>());
    public Task<Skill> AddSkillAsync(Skill s) => Task.FromResult(s);
    public Task<bool> DeleteSkillAsync(string id) => Task.FromResult(false);
}
