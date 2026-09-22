using System.Text.RegularExpressions;

namespace CVCurator.API.Services;

/// <summary>
/// Keyword extraction and relevance scoring engine.
///
/// Design note: this is intentionally a pure keyword-matching approach so the app
/// works with zero external dependencies. The interface is designed to be replaced
/// with an LLM-backed implementation later — swap the DI registration in Program.cs.
/// </summary>
public class KeywordExtractionService : IKeywordExtractionService
{
    // Common English stop-words that carry no signal
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
        "been", "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "shall", "can", "need",
        "dare", "ought", "used", "we", "you", "he", "she", "it", "they",
        "i", "me", "him", "her", "us", "them", "my", "your", "his", "its",
        "our", "their", "what", "which", "who", "this", "that", "these", "those",
        "not", "no", "nor", "so", "yet", "both", "either", "neither", "whether",
        "if", "then", "than", "too", "very", "just", "about", "above", "across",
        "after", "against", "along", "among", "around", "before", "behind",
        "between", "beyond", "during", "except", "into", "like", "near",
        "off", "out", "over", "past", "through", "under", "up", "upon",
        "within", "without", "following", "including", "plus", "also",
        "such", "all", "any", "each", "every", "few", "more", "most",
        "other", "some", "work", "working", "experience", "strong",
        "excellent", "good", "ability", "skills", "looking", "required",
        "preferred", "must", "ideal", "ideally", "role", "position", "join",
        "team", "company", "candidate", "candidates", "responsible", "responsibilities"
    };

    // Bigrams to keep together as single units (common tech phrases)
    private static readonly HashSet<string> TechBigrams = new(StringComparer.OrdinalIgnoreCase)
    {
        "machine learning", "deep learning", "natural language", "neural network",
        "rest api", "web api", "api design", "api development", "unit testing",
        "test driven", "test-driven", "code review", "version control",
        "continuous integration", "continuous deployment", "ci/cd",
        "cloud native", "cloud computing", "data structures", "design patterns",
        "object oriented", "object-oriented", "functional programming",
        "agile methodology", "agile development", "scrum master",
        "software development", "full stack", "full-stack", "front end", "back end",
        "front-end", "back-end", "open source"
    };

    public List<string> ExtractKeywords(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return new List<string>();

        var normalised = text.ToLowerInvariant();

        // Step 1: Extract bigrams that are known tech phrases before splitting
        var bigramKeywords = ExtractBigrams(normalised);

        // Step 2: Tokenise — split on whitespace and punctuation (keep hyphens in compound words)
        var tokens = Regex.Split(normalised, @"[^\w\-\+\#\/\.]+")
            .Select(t => t.Trim('.', '-', '_'))
            .Where(t => t.Length >= 2 && !string.IsNullOrWhiteSpace(t))
            .ToList();

        // Step 3: Remove stop-words and numeric-only tokens
        var meaningful = tokens
            .Where(t => !StopWords.Contains(t) && !Regex.IsMatch(t, @"^\d+$"))
            .Distinct()
            .ToList();

        // Combine bigrams and individual keywords; bigrams take priority
        var combined = bigramKeywords.Concat(meaningful).Distinct().ToList();
        return combined;
    }

    public double ScoreRelevance(IEnumerable<string> jobKeywords, IEnumerable<string> candidateTokens)
    {
        var keywordList = jobKeywords.Select(k => k.ToLowerInvariant()).ToList();
        var candidateSet = candidateTokens.Select(t => t.ToLowerInvariant()).ToHashSet();

        if (keywordList.Count == 0) return 0.0;

        int matches = 0;
        foreach (var keyword in keywordList)
        {
            // Exact match
            if (candidateSet.Contains(keyword))
            {
                matches++;
                continue;
            }

            // Partial match: job keyword appears as substring within a candidate token
            // (e.g. "kubernetes" matches "kubernetes-based")
            if (candidateSet.Any(c => c.Contains(keyword) || keyword.Contains(c)))
            {
                matches++; // partial match counts as full match for simplicity
            }
        }

        return (double)matches / keywordList.Count;
    }

    // ─────────────────────────────── Helpers ─────────────────────────────────

    private static List<string> ExtractBigrams(string text)
    {
        var found = new List<string>();
        foreach (var bigram in TechBigrams)
        {
            if (text.Contains(bigram, StringComparison.OrdinalIgnoreCase))
                found.Add(bigram);
        }
        return found;
    }
}
