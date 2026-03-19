namespace CVCurator.API.Services;

public interface IKeywordExtractionService
{
    /// <summary>
    /// Extract meaningful keywords from free text. Returns normalised (lowercase) tokens.
    /// </summary>
    List<string> ExtractKeywords(string text);

    /// <summary>
    /// Calculate how many job keywords are present in the candidate text.
    /// Returns a score in the range [0, 1].
    /// </summary>
    double ScoreRelevance(IEnumerable<string> jobKeywords, IEnumerable<string> candidateTokens);
}
