using CVCurator.API.Models;

namespace CVCurator.API.Services;

/// <summary>
/// Thread-safe in-memory storage. Pre-seeded with sample data so the app works
/// out of the box. Replace with a DB-backed implementation later without changing
/// any controllers — just swap the DI registration in Program.cs.
/// </summary>
public class InMemoryStorageService : IStorageService
{
    private readonly object _lock = new();

    private UserProfile? _profile;
    private readonly List<WorkExperience> _experiences = new();
    private readonly List<Project> _projects = new();
    private readonly List<Education> _educations = new();
    private readonly List<Skill> _skills = new();

    public InMemoryStorageService()
    {
        SeedData();
    }

    // ──────────────────────────────── Profile ────────────────────────────────

    public Task<UserProfile?> GetProfileAsync()
    {
        lock (_lock) return Task.FromResult(_profile);
    }

    public Task<UserProfile> UpsertProfileAsync(UserProfile profile)
    {
        lock (_lock)
        {
            _profile = profile;
            return Task.FromResult(profile);
        }
    }

    // ─────────────────────────── Work Experience ─────────────────────────────

    public Task<List<WorkExperience>> GetExperienceAsync()
    {
        lock (_lock) return Task.FromResult(new List<WorkExperience>(_experiences));
    }

    public Task<WorkExperience> AddExperienceAsync(WorkExperience experience)
    {
        lock (_lock)
        {
            _experiences.Add(experience);
            return Task.FromResult(experience);
        }
    }

    public Task<WorkExperience?> UpdateExperienceAsync(string id, WorkExperience updated)
    {
        lock (_lock)
        {
            var idx = _experiences.FindIndex(e => e.Id == id);
            if (idx < 0) return Task.FromResult<WorkExperience?>(null);
            updated.Id = id;
            _experiences[idx] = updated;
            return Task.FromResult<WorkExperience?>(updated);
        }
    }

    public Task<bool> DeleteExperienceAsync(string id)
    {
        lock (_lock)
        {
            var removed = _experiences.RemoveAll(e => e.Id == id);
            return Task.FromResult(removed > 0);
        }
    }

    // ──────────────────────────────── Projects ────────────────────────────────

    public Task<List<Project>> GetProjectsAsync()
    {
        lock (_lock) return Task.FromResult(new List<Project>(_projects));
    }

    public Task<Project> AddProjectAsync(Project project)
    {
        lock (_lock)
        {
            _projects.Add(project);
            return Task.FromResult(project);
        }
    }

    public Task<Project?> UpdateProjectAsync(string id, Project updated)
    {
        lock (_lock)
        {
            var idx = _projects.FindIndex(p => p.Id == id);
            if (idx < 0) return Task.FromResult<Project?>(null);
            updated.Id = id;
            _projects[idx] = updated;
            return Task.FromResult<Project?>(updated);
        }
    }

    public Task<bool> DeleteProjectAsync(string id)
    {
        lock (_lock)
        {
            var removed = _projects.RemoveAll(p => p.Id == id);
            return Task.FromResult(removed > 0);
        }
    }

    // ──────────────────────────────── Education ───────────────────────────────

    public Task<List<Education>> GetEducationAsync()
    {
        lock (_lock) return Task.FromResult(new List<Education>(_educations));
    }

    public Task<Education> AddEducationAsync(Education education)
    {
        lock (_lock)
        {
            _educations.Add(education);
            return Task.FromResult(education);
        }
    }

    public Task<Education?> UpdateEducationAsync(string id, Education updated)
    {
        lock (_lock)
        {
            var idx = _educations.FindIndex(e => e.Id == id);
            if (idx < 0) return Task.FromResult<Education?>(null);
            updated.Id = id;
            _educations[idx] = updated;
            return Task.FromResult<Education?>(updated);
        }
    }

    public Task<bool> DeleteEducationAsync(string id)
    {
        lock (_lock)
        {
            var removed = _educations.RemoveAll(e => e.Id == id);
            return Task.FromResult(removed > 0);
        }
    }

    // ──────────────────────────────── Skills ──────────────────────────────────

    public Task<List<Skill>> GetSkillsAsync()
    {
        lock (_lock) return Task.FromResult(new List<Skill>(_skills));
    }

    public Task<Skill> AddSkillAsync(Skill skill)
    {
        lock (_lock)
        {
            _skills.Add(skill);
            return Task.FromResult(skill);
        }
    }

    public Task<bool> DeleteSkillAsync(string id)
    {
        lock (_lock)
        {
            var removed = _skills.RemoveAll(s => s.Id == id);
            return Task.FromResult(removed > 0);
        }
    }

    // ─────────────────────────────── Seed Data ───────────────────────────────

    private void SeedData()
    {
        _profile = new UserProfile
        {
            Id = "profile-1",
            Name = "Alex Johnson",
            Email = "alex.johnson@email.com",
            Location = "London, UK",
            Summary = "Experienced software engineer with 5+ years building scalable web applications.",
            Links = new ProfileLinks
            {
                GitHub = "https://github.com/alexjohnson",
                LinkedIn = "https://linkedin.com/in/alexjohnson",
                Portfolio = "https://alexjohnson.dev"
            }
        };

        _experiences.AddRange(new[]
        {
            new WorkExperience
            {
                Id = "exp-1",
                Company = "TechCorp Ltd",
                Role = "Senior Software Engineer",
                StartDate = new DateTime(2021, 3, 1),
                EndDate = null,
                BulletPoints = new List<string>
                {
                    "Led development of microservices architecture using .NET 6 and Docker",
                    "Improved API response times by 40% through Redis caching and query optimisation",
                    "Mentored 3 junior developers and conducted code reviews",
                    "Built CI/CD pipelines using GitHub Actions reducing deployment time by 60%",
                    "Collaborated with product team to define technical requirements"
                },
                Skills = new List<string> { "C#", ".NET", "Docker", "Redis", "Kubernetes", "GitHub Actions", "Microservices" }
            },
            new WorkExperience
            {
                Id = "exp-2",
                Company = "StartupXYZ",
                Role = "Full Stack Developer",
                StartDate = new DateTime(2019, 6, 1),
                EndDate = new DateTime(2021, 2, 28),
                BulletPoints = new List<string>
                {
                    "Built React frontend with TypeScript for a SaaS dashboard serving 10k+ users",
                    "Designed and implemented REST APIs using Node.js and Express",
                    "Integrated third-party payment APIs (Stripe) increasing conversion by 15%",
                    "Wrote unit and integration tests achieving 85% code coverage"
                },
                Skills = new List<string> { "React", "TypeScript", "Node.js", "PostgreSQL", "REST API", "Stripe", "Jest" }
            },
            new WorkExperience
            {
                Id = "exp-3",
                Company = "Digital Agency Co",
                Role = "Junior Developer",
                StartDate = new DateTime(2018, 1, 1),
                EndDate = new DateTime(2019, 5, 31),
                BulletPoints = new List<string>
                {
                    "Developed responsive web applications using HTML, CSS, and JavaScript",
                    "Maintained and extended WordPress and Laravel PHP applications",
                    "Participated in agile ceremonies including sprint planning and retrospectives"
                },
                Skills = new List<string> { "JavaScript", "PHP", "Laravel", "MySQL", "HTML", "CSS" }
            }
        });

        _projects.AddRange(new[]
        {
            new Project
            {
                Id = "proj-1",
                Name = "CloudDeploy Dashboard",
                Description = "A real-time deployment monitoring dashboard with WebSocket updates, role-based access control, and multi-cloud support (AWS, GCP, Azure).",
                TechStack = new List<string> { "React", "TypeScript", "Next.js", "WebSockets", "AWS", "Docker" },
                Link = "https://github.com/alexjohnson/cloud-deploy"
            },
            new Project
            {
                Id = "proj-2",
                Name = "OpenCV Face Recognition API",
                Description = "A Python/FastAPI microservice for real-time face detection and recognition using OpenCV and a custom ML model.",
                TechStack = new List<string> { "Python", "FastAPI", "OpenCV", "TensorFlow", "Docker", "PostgreSQL" },
                Link = "https://github.com/alexjohnson/face-recognition-api"
            },
            new Project
            {
                Id = "proj-3",
                Name = "E-Commerce Platform",
                Description = "Full-stack e-commerce platform with product management, shopping cart, Stripe payments, and admin dashboard.",
                TechStack = new List<string> { "React", "Node.js", "Express", "MongoDB", "Stripe", "Redux" },
                Link = "https://github.com/alexjohnson/ecommerce"
            }
        });

        _educations.Add(new Education
        {
            Id = "edu-1",
            Institution = "University of Manchester",
            Course = "BSc Computer Science",
            StartDate = new DateTime(2014, 9, 1),
            EndDate = new DateTime(2017, 6, 30),
            Grade = "First Class Honours"
        });

        _skills.AddRange(new[]
        {
            new Skill { Id = "skill-1", Name = "C#", Category = "Languages" },
            new Skill { Id = "skill-2", Name = "TypeScript", Category = "Languages" },
            new Skill { Id = "skill-3", Name = "Python", Category = "Languages" },
            new Skill { Id = "skill-4", Name = "React", Category = "Frontend" },
            new Skill { Id = "skill-5", Name = "Next.js", Category = "Frontend" },
            new Skill { Id = "skill-6", Name = ".NET Core", Category = "Backend" },
            new Skill { Id = "skill-7", Name = "Node.js", Category = "Backend" },
            new Skill { Id = "skill-8", Name = "Docker", Category = "DevOps" },
            new Skill { Id = "skill-9", Name = "Kubernetes", Category = "DevOps" },
            new Skill { Id = "skill-10", Name = "PostgreSQL", Category = "Databases" },
            new Skill { Id = "skill-11", Name = "Redis", Category = "Databases" },
            new Skill { Id = "skill-12", Name = "AWS", Category = "Cloud" },
        });
    }
}
