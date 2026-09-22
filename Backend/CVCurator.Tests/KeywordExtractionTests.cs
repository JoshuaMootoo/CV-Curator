using CVCurator.API.Services;
using FluentAssertions;
using Xunit;

namespace CVCurator.Tests;

public class KeywordExtractionTests
{
    private readonly KeywordExtractionService _sut = new();

    // ─────────────────────────── ExtractKeywords ─────────────────────────────

    [Fact]
    public void ExtractKeywords_ReturnsEmptyList_ForEmptyInput()
    {
        var result = _sut.ExtractKeywords(string.Empty);
        result.Should().BeEmpty();
    }

    [Fact]
    public void ExtractKeywords_NormalisesToLowercase()
    {
        var result = _sut.ExtractKeywords("React TypeScript Docker");
        result.Should().Contain("react");
        result.Should().Contain("typescript");
        result.Should().Contain("docker");
    }

    [Fact]
    public void ExtractKeywords_RemovesStopWords()
    {
        var result = _sut.ExtractKeywords("we are looking for a strong developer");
        result.Should().NotContain("we");
        result.Should().NotContain("are");
        result.Should().NotContain("a");
        result.Should().NotContain("for");
        result.Should().Contain("developer");
    }

    [Fact]
    public void ExtractKeywords_RemovesPunctuation()
    {
        var result = _sut.ExtractKeywords("C#, .NET, and TypeScript.");
        result.Should().Contain("c#");
        result.Should().Contain(".net");
        result.Should().Contain("typescript");
    }

    [Fact]
    public void ExtractKeywords_ExtractsTechBigrams()
    {
        var result = _sut.ExtractKeywords("Experience with machine learning and deep learning is required.");
        result.Should().Contain("machine learning");
        result.Should().Contain("deep learning");
    }

    [Fact]
    public void ExtractKeywords_PreservesTechTermsWithSpecialChars()
    {
        var result = _sut.ExtractKeywords("Proficiency in C#, .NET Core and CI/CD pipelines");
        result.Should().Contain("c#");
        result.Should().Contain(".net");
        result.Should().Contain("ci/cd");
    }

    [Fact]
    public void ExtractKeywords_RemovesPureNumbers()
    {
        var result = _sut.ExtractKeywords("3 years of experience with 5 microservices");
        result.Should().NotContain("3");
        result.Should().NotContain("5");
        result.Should().Contain("microservices");
    }

    [Fact]
    public void ExtractKeywords_ReturnsDistinctKeywords()
    {
        var result = _sut.ExtractKeywords("React React React TypeScript");
        result.Count(k => k == "react").Should().Be(1);
    }

    // ─────────────────────────── ScoreRelevance ──────────────────────────────

    [Fact]
    public void ScoreRelevance_ReturnsZero_WhenNoJobKeywords()
    {
        var score = _sut.ScoreRelevance(new List<string>(), new List<string> { "react", "typescript" });
        score.Should().Be(0.0);
    }

    [Fact]
    public void ScoreRelevance_ReturnsOne_WhenAllKeywordsMatch()
    {
        var keywords = new List<string> { "react", "typescript", "docker" };
        var candidate = new List<string> { "react", "typescript", "docker", "node" };
        var score = _sut.ScoreRelevance(keywords, candidate);
        score.Should().Be(1.0);
    }

    [Fact]
    public void ScoreRelevance_ReturnsZero_WhenNoMatches()
    {
        var keywords = new List<string> { "java", "spring", "hibernate" };
        var candidate = new List<string> { "react", "typescript", "docker" };
        var score = _sut.ScoreRelevance(keywords, candidate);
        score.Should().Be(0.0);
    }

    [Fact]
    public void ScoreRelevance_ReturnsPartialScore_ForPartialMatches()
    {
        var keywords = new List<string> { "react", "typescript", "java" };
        var candidate = new List<string> { "react", "typescript", "python" };
        var score = _sut.ScoreRelevance(keywords, candidate);
        score.Should().BeApproximately(2.0 / 3.0, 0.001);
    }

    [Fact]
    public void ScoreRelevance_IsCaseInsensitive()
    {
        var keywords = new List<string> { "React", "TypeScript" };
        var candidate = new List<string> { "react", "typescript" };
        var score = _sut.ScoreRelevance(keywords, candidate);
        score.Should().Be(1.0);
    }

    [Fact]
    public void ScoreRelevance_MatchesPartialSubstrings()
    {
        // "kubernetes" should match "kubernetes-based"
        var keywords = new List<string> { "kubernetes" };
        var candidate = new List<string> { "kubernetes-based" };
        var score = _sut.ScoreRelevance(keywords, candidate);
        score.Should().Be(1.0);
    }
}
