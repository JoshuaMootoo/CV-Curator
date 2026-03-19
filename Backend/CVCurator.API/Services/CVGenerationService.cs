using CVCurator.API.Models;

namespace CVCurator.API.Services;

/// <summary>
/// Orchestrates the CV tailoring pipeline:
///  1. Extract keywords from the job description
///  2. Score each experience and project against those keywords
///  3. Rank and filter to the top N entries
///  4. Reorder bullet points so the most relevant ones appear first
///  5. Build the structured GeneratedCV and a plain-text formatted version
///
/// This class is designed to be an LLM drop-in point: replace steps 1–4 with
/// an LLM call by swapping the DI registration for ICVGenerationService.
/// </summary>
public class CVGenerationService : ICVGenerationService
{
    private readonly IStorageService _storage;
    private readonly IKeywordExtractionService _keywordExtraction;

    public CVGenerationService(IStorageService storage, IKeywordExtractionService keywordExtraction)
    {
        _storage = storage;
        _keywordExtraction = keywordExtraction;
    }

    public async Task<GeneratedCV> GenerateAsync(GenerateCVRequest request)
    {
        // ── 1. Load all stored data in parallel ──
        var (profile, experiences, projects, educations, skills) = await LoadAllDataAsync();

        if (profile is null)
            throw new InvalidOperationException("No profile found. Please create a profile first.");

        // ── 2. Extract and normalise keywords from the job description ──
        var jobKeywords = _keywordExtraction.ExtractKeywords(request.JobDescription);

        // ── 3. Score and rank work experience ──
        var scoredExperiences = ScoreExperiences(experiences, jobKeywords, request.MaxExperience);

        // ── 4. Score and rank projects ──
        var scoredProjects = ScoreProjects(projects, jobKeywords, request.MaxProjects);

        // ── 5. Build skills list: prioritise skills matching job keywords ──
        var rankedSkills = RankSkills(skills, jobKeywords);

        // ── 6. Assemble the CV ──
        var cv = new GeneratedCV
        {
            PersonalInfo = new PersonalInfo
            {
                Name = profile.Name,
                Email = profile.Email,
                Location = profile.Location,
                Links = profile.Links
            },
            Summary = profile.Summary,
            Experience = scoredExperiences,
            Projects = scoredProjects,
            Education = educations.OrderByDescending(e => e.StartDate).ToList(),
            Skills = rankedSkills,
            ExtractedKeywords = jobKeywords
        };

        cv.FormattedText = BuildFormattedText(cv);

        return cv;
    }

    // ─────────────────────────── Scoring helpers ─────────────────────────────

    /// <summary>
    /// Score each experience entry and return the top N, ranked by relevance.
    /// Within each entry, bubble matching bullet points to the top.
    /// </summary>
    private List<ScoredExperience> ScoreExperiences(
        List<WorkExperience> experiences,
        List<string> jobKeywords,
        int maxEntries)
    {
        var scored = new List<ScoredExperience>();

        foreach (var exp in experiences)
        {
            // Candidate text = skills + all bullet points combined
            var candidateText = string.Join(" ", exp.Skills.Concat(exp.BulletPoints));
            var candidateTokens = _keywordExtraction.ExtractKeywords(candidateText);
            var score = _keywordExtraction.ScoreRelevance(jobKeywords, candidateTokens);

            // Reorder bullet points: those containing job keywords move to the top
            var reorderedBullets = ReorderBullets(exp.BulletPoints, jobKeywords);

            scored.Add(new ScoredExperience
            {
                Id = exp.Id,
                Company = exp.Company,
                Role = exp.Role,
                StartDate = exp.StartDate,
                EndDate = exp.EndDate,
                BulletPoints = reorderedBullets,
                Skills = exp.Skills,
                RelevanceScore = score
            });
        }

        return scored
            .OrderByDescending(e => e.RelevanceScore)
            .Take(maxEntries)
            .ToList();
    }

    /// <summary>
    /// Score each project and return the top N, ranked by relevance.
    /// </summary>
    private List<ScoredProject> ScoreProjects(
        List<Project> projects,
        List<string> jobKeywords,
        int maxEntries)
    {
        var scored = new List<ScoredProject>();

        foreach (var proj in projects)
        {
            var candidateText = string.Join(" ", proj.TechStack) + " " + proj.Description + " " + proj.Name;
            var candidateTokens = _keywordExtraction.ExtractKeywords(candidateText);
            var score = _keywordExtraction.ScoreRelevance(jobKeywords, candidateTokens);

            scored.Add(new ScoredProject
            {
                Id = proj.Id,
                Name = proj.Name,
                Description = proj.Description,
                TechStack = proj.TechStack,
                Link = proj.Link,
                RelevanceScore = score
            });
        }

        return scored
            .OrderByDescending(p => p.RelevanceScore)
            .Take(maxEntries)
            .ToList();
    }

    /// <summary>
    /// Sort the global skills list so that skills matching job keywords appear first.
    /// </summary>
    private static List<string> RankSkills(List<Skill> skills, List<string> jobKeywords)
    {
        var keywordSet = jobKeywords.Select(k => k.ToLowerInvariant()).ToHashSet();

        return skills
            .OrderByDescending(s => keywordSet.Contains(s.Name.ToLowerInvariant()) ? 1 : 0)
            .ThenBy(s => s.Category)
            .ThenBy(s => s.Name)
            .Select(s => s.Name)
            .ToList();
    }

    /// <summary>
    /// Move bullet points that mention job keywords to the front of the list.
    /// Points are scored by how many keywords they contain.
    /// </summary>
    private List<string> ReorderBullets(List<string> bullets, List<string> jobKeywords)
    {
        return bullets
            .Select(b =>
            {
                var tokens = _keywordExtraction.ExtractKeywords(b);
                var score = _keywordExtraction.ScoreRelevance(jobKeywords, tokens);
                return (Bullet: b, Score: score);
            })
            .OrderByDescending(x => x.Score)
            .Select(x => x.Bullet)
            .ToList();
    }

    // ─────────────────────────── Text formatter ──────────────────────────────

    /// <summary>Builds a clean plain-text version of the CV suitable for copying.</summary>
    private static string BuildFormattedText(GeneratedCV cv)
    {
        var sb = new System.Text.StringBuilder();
        var sep = new string('─', 60);

        // Header
        sb.AppendLine(cv.PersonalInfo.Name.ToUpperInvariant());
        sb.AppendLine($"{cv.PersonalInfo.Email} | {cv.PersonalInfo.Location}");

        var links = new List<string?> {
            cv.PersonalInfo.Links.LinkedIn,
            cv.PersonalInfo.Links.GitHub,
            cv.PersonalInfo.Links.Portfolio
        }.Where(l => !string.IsNullOrEmpty(l));
        if (links.Any())
            sb.AppendLine(string.Join(" | ", links));

        // Summary
        if (!string.IsNullOrWhiteSpace(cv.Summary))
        {
            sb.AppendLine();
            sb.AppendLine("SUMMARY");
            sb.AppendLine(sep);
            sb.AppendLine(cv.Summary);
        }

        // Experience
        if (cv.Experience.Any())
        {
            sb.AppendLine();
            sb.AppendLine("EXPERIENCE");
            sb.AppendLine(sep);
            foreach (var exp in cv.Experience)
            {
                var end = exp.EndDate.HasValue ? exp.EndDate.Value.ToString("MMM yyyy") : "Present";
                sb.AppendLine($"{exp.Role} — {exp.Company}");
                sb.AppendLine($"{exp.StartDate:MMM yyyy} – {end}");
                foreach (var bullet in exp.BulletPoints)
                    sb.AppendLine($"  • {bullet}");
                sb.AppendLine();
            }
        }

        // Projects
        if (cv.Projects.Any())
        {
            sb.AppendLine("PROJECTS");
            sb.AppendLine(sep);
            foreach (var proj in cv.Projects)
            {
                sb.AppendLine($"{proj.Name}");
                sb.AppendLine($"  {proj.Description}");
                sb.AppendLine($"  Tech: {string.Join(", ", proj.TechStack)}");
                if (!string.IsNullOrEmpty(proj.Link))
                    sb.AppendLine($"  Link: {proj.Link}");
                sb.AppendLine();
            }
        }

        // Education
        if (cv.Education.Any())
        {
            sb.AppendLine("EDUCATION");
            sb.AppendLine(sep);
            foreach (var edu in cv.Education)
            {
                var end = edu.EndDate.HasValue ? edu.EndDate.Value.ToString("MMM yyyy") : "Present";
                sb.AppendLine($"{edu.Course} — {edu.Institution}");
                sb.AppendLine($"{edu.StartDate:MMM yyyy} – {end}");
                if (!string.IsNullOrEmpty(edu.Grade))
                    sb.AppendLine($"  Grade: {edu.Grade}");
                sb.AppendLine();
            }
        }

        // Skills
        if (cv.Skills.Any())
        {
            sb.AppendLine("SKILLS");
            sb.AppendLine(sep);
            sb.AppendLine(string.Join(" | ", cv.Skills));
        }

        return sb.ToString();
    }

    // ─────────────────────────── Data loader ─────────────────────────────────

    private async Task<(UserProfile? profile,
                        List<WorkExperience> experiences,
                        List<Project> projects,
                        List<Education> educations,
                        List<Skill> skills)> LoadAllDataAsync()
    {
        var profileTask = _storage.GetProfileAsync();
        var expTask = _storage.GetExperienceAsync();
        var projTask = _storage.GetProjectsAsync();
        var eduTask = _storage.GetEducationAsync();
        var skillTask = _storage.GetSkillsAsync();

        await Task.WhenAll(profileTask, expTask, projTask, eduTask, skillTask);

        return (profileTask.Result, expTask.Result, projTask.Result, eduTask.Result, skillTask.Result);
    }
}
