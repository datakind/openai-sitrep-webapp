import { describe, expect, it } from "vitest";
import { buildSummaryInstructions } from "./summaryPrompt";

describe("buildSummaryInstructions", () => {
  it("requests a UNOCHA-style Situation Report structure", () => {
    const prompt = buildSummaryInstructions(["alpha.pdf", "beta.csv"]);

    expect(prompt).toContain("UNOCHA-style Situation Report summary");
    expect(prompt).toContain("Write the full report in English.");
    expect(prompt).toContain("# Situation Report: [crisis/event] - [location]");
    expect(prompt).toContain("## Highlights");
    expect(prompt).toContain("## Situation overview");
    expect(prompt).toContain("## Humanitarian impact and needs");
    expect(prompt).toContain("## Response");
    expect(prompt).toContain("## Gaps and constraints");
    expect(prompt).toContain("## Key figures");
    expect(prompt).toContain("valid multi-line Markdown table");
    expect(prompt).toContain("each data row on separate lines");
    expect(prompt).toContain("## Visualization");
    expect(prompt).toContain("## Outlook and priorities");
    expect(prompt).toContain("## References");
    expect(prompt).toContain("[S1] alpha.pdf");
    expect(prompt).toContain("[S2] beta.csv");
  });

  it("guards against unsupported facts", () => {
    const prompt = buildSummaryInstructions(["source.docx"]);

    expect(prompt).toContain("Do not invent locations, dates, figures");
    expect(prompt).toContain("Every factual claim and every figure must include an inline citation");
    expect(prompt).toContain("Information not available in the uploaded documents.");
    expect(prompt).toContain("not an official UNOCHA publication");
  });

  it("prioritizes recent data and requires a visualization", () => {
    const prompt = buildSummaryInstructions(["older.pdf", "newer.pdf"]);

    expect(prompt).toContain("Prefer the most recent supported data");
    expect(prompt).toContain("Lead with the newest and most operationally significant information");
    expect(prompt).toContain("Create at least one simple text visualization");
    expect(prompt).toContain("fenced code block with proportional bars");
  });

  it("can request Central Thai output", () => {
    const prompt = buildSummaryInstructions(["source.docx"], "Central Thai");

    expect(prompt).toContain("Write the full report in Central Thai.");
  });
});
