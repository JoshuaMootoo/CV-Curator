using CVCurator.API.Models;

namespace CVCurator.API.Services;

/// <summary>
/// Abstraction over data storage — swap in-memory for a real DB without touching controllers.
/// </summary>
public interface IStorageService
{
    // Profile
    Task<UserProfile?> GetProfileAsync();
    Task<UserProfile> UpsertProfileAsync(UserProfile profile);

    // Work Experience
    Task<List<WorkExperience>> GetExperienceAsync();
    Task<WorkExperience> AddExperienceAsync(WorkExperience experience);
    Task<WorkExperience?> UpdateExperienceAsync(string id, WorkExperience experience);
    Task<bool> DeleteExperienceAsync(string id);

    // Projects
    Task<List<Project>> GetProjectsAsync();
    Task<Project> AddProjectAsync(Project project);
    Task<Project?> UpdateProjectAsync(string id, Project project);
    Task<bool> DeleteProjectAsync(string id);

    // Education
    Task<List<Education>> GetEducationAsync();
    Task<Education> AddEducationAsync(Education education);
    Task<Education?> UpdateEducationAsync(string id, Education education);
    Task<bool> DeleteEducationAsync(string id);

    // Skills
    Task<List<Skill>> GetSkillsAsync();
    Task<Skill> AddSkillAsync(Skill skill);
    Task<bool> DeleteSkillAsync(string id);
}
