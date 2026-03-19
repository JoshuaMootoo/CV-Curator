# CV Curator — Smart CV Generator

A full-stack application that lets you store structured CV data once, then generate a tailored CV from a job description using keyword extraction and relevance scoring.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend  | ASP.NET Core 8 Web API (C#)         |
| Storage  | In-memory (swap for DB via DI)      |
| AI/Logic | Keyword matching + scoring engine   |

---

## Project Structure

```
CV-Curator/
├── Backend/
│   ├── CVCurator.sln
│   ├── CVCurator.API/
│   │   ├── Controllers/        # HTTP endpoints
│   │   │   ├── ProfileController.cs
│   │   │   ├── ExperienceController.cs
│   │   │   ├── ProjectsController.cs
│   │   │   ├── EducationController.cs
│   │   │   ├── SkillsController.cs
│   │   │   └── CVGenerationController.cs
│   │   ├── Models/             # Strongly-typed data models
│   │   │   ├── UserProfile.cs
│   │   │   ├── WorkExperience.cs
│   │   │   ├── Education.cs
│   │   │   ├── Project.cs
│   │   │   ├── Skill.cs
│   │   │   └── GeneratedCV.cs
│   │   └── Services/           # Business logic (DI-swappable)
│   │       ├── IStorageService.cs
│   │       ├── InMemoryStorageService.cs
│   │       ├── IKeywordExtractionService.cs
│   │       ├── KeywordExtractionService.cs
│   │       ├── ICVGenerationService.cs
│   │       └── CVGenerationService.cs
│   └── CVCurator.Tests/        # xUnit tests
│       ├── KeywordExtractionTests.cs
│       └── ScoringTests.cs
├── Frontend/
│   └── src/
│       ├── app/                # Next.js App Router pages
│       │   ├── page.tsx        # Dashboard
│       │   ├── editor/         # CV Editor (profile, experience, projects…)
│       │   ├── generate/       # Job description input
│       │   └── output/         # Generated CV display
│       ├── components/         # Reusable UI components
│       │   ├── Navigation.tsx
│       │   ├── ExperienceForm.tsx
│       │   ├── ProjectForm.tsx
│       │   ├── EducationForm.tsx
│       │   └── CVDisplay.tsx
│       ├── context/
│       │   └── CVContext.tsx   # Global state (React Context)
│       └── lib/
│           ├── types.ts        # TypeScript interfaces (mirrors C# models)
│           └── api.ts          # API client (fetch wrapper)
└── docs/
    ├── example-data.json
    └── example-job-description.txt
```

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)

---

## Running the Application

### 1. Start the Backend

```bash
cd Backend/CVCurator.API
dotnet run
```

The API will start on **http://localhost:5000**.

Swagger UI is available at: **http://localhost:5000/swagger**

### 2. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:3000**.

> Next.js proxies all `/api/*` requests to the backend via `next.config.js`.

---

## Running Tests

```bash
cd Backend
dotnet test CVCurator.sln --verbosity normal
```

Tests cover:
- `KeywordExtractionTests` — keyword extraction, stop-word removal, normalisation
- `ScoringTests` — full CV generation pipeline, relevance scoring, ranking

---

## API Reference

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/api/profile`         | Get user profile                     |
| POST   | `/api/profile`         | Create profile                       |
| PUT    | `/api/profile`         | Update profile                       |
| GET    | `/api/experience`      | List all work experience             |
| POST   | `/api/experience`      | Add work experience                  |
| PUT    | `/api/experience/{id}` | Update work experience               |
| DELETE | `/api/experience/{id}` | Delete work experience               |
| GET    | `/api/projects`        | List all projects                    |
| POST   | `/api/projects`        | Add project                          |
| PUT    | `/api/projects/{id}`   | Update project                       |
| DELETE | `/api/projects/{id}`   | Delete project                       |
| GET    | `/api/education`       | List all education                   |
| POST   | `/api/education`       | Add education                        |
| PUT    | `/api/education/{id}`  | Update education                     |
| DELETE | `/api/education/{id}`  | Delete education                     |
| GET    | `/api/skills`          | List all skills                      |
| POST   | `/api/skills`          | Add skill                            |
| DELETE | `/api/skills/{id}`     | Delete skill                         |
| POST   | `/api/generate-cv`     | Generate tailored CV                 |

### POST `/api/generate-cv` — Request body

```json
{
  "jobDescription": "We need a .NET developer with React and Docker...",
  "maxExperience": 5,
  "maxProjects": 4
}
```

### POST `/api/generate-cv` — Response

```json
{
  "personalInfo": { "name": "...", "email": "...", "location": "...", "links": {} },
  "summary": "...",
  "experience": [
    {
      "id": "exp-1",
      "company": "TechCorp",
      "role": "Senior Engineer",
      "startDate": "2021-03-01",
      "endDate": null,
      "bulletPoints": ["..."],
      "skills": ["C#", "Docker"],
      "relevanceScore": 0.82
    }
  ],
  "projects": [],
  "education": [],
  "skills": ["C#", "Docker", "React", "..."],
  "formattedText": "ALEX JOHNSON\n...",
  "extractedKeywords": [".net", "docker", "react", "typescript", "..."]
}
```

---

## CV Generation Engine

The tailoring engine (`CVGenerationService.cs`) works in 5 steps:

1. **Extract keywords** from the job description
   - Remove stop-words, normalise to lowercase
   - Preserve tech terms with special characters (`C#`, `.NET`, `CI/CD`)
   - Extract known bigrams (`machine learning`, `rest api`, etc.)

2. **Score each experience** by comparing job keywords against skills + bullet points
   - Score = `matched_keywords / total_keywords`
   - Partial substring matching (e.g. `kubernetes` matches `kubernetes-based`)

3. **Score each project** by comparing keywords against tech stack + description

4. **Rank and filter** — keep only the top N entries by score

5. **Reorder bullet points** — within each experience, move the most keyword-rich bullets to the top

### Plugging in an LLM

The engine is designed for easy LLM integration:

1. Create a new class implementing `ICVGenerationService`
2. Replace keyword matching with LLM calls (e.g. OpenAI, Claude API)
3. Swap the DI registration in `Program.cs`:

```csharp
// Before:
builder.Services.AddScoped<ICVGenerationService, CVGenerationService>();

// After:
builder.Services.AddScoped<ICVGenerationService, LLMCVGenerationService>();
```

---

## Testing with Example Data

The backend is pre-seeded with a complete sample CV (Alex Johnson) so the app works immediately without adding data.

Use the example job description from `docs/example-job-description.txt`, or click **"Load example"** on the Generate page.

Test via curl:

```bash
curl -X POST http://localhost:5000/api/generate-cv \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior .NET developer with React, Docker, and Kubernetes. CI/CD with GitHub Actions. PostgreSQL and Redis.",
    "maxExperience": 3,
    "maxProjects": 3
  }'
```

---

## Extending Storage

To swap in a real database:

1. Implement `IStorageService` (e.g. using Entity Framework Core)
2. Change the DI registration in `Program.cs`:

```csharp
builder.Services.AddScoped<IStorageService, SqlStorageService>();
```

No controllers need to change.

---

## Stretch Goals (scaffolded for extension)

- **PDF export** — add `/api/generate-cv/pdf` using `QuestPDF`
- **CV templates** — add a `template` field to `GenerateCVRequest`
- **LLM integration** — implement `ICVGenerationService` using the Anthropic or OpenAI SDK
