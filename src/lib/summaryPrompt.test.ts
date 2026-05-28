import { describe, expect, it } from "vitest";
import { buildSummaryInstructions } from "./summaryPrompt";

describe("buildSummaryInstructions", () => {
  it("requests a UNOCHA-style Situation Report structure", () => {
    const prompt = buildSummaryInstructions(["alpha.pdf", "beta.csv"]);

    expect(prompt).toContain("UNOCHA-style Situation Report");
    expect(prompt).toContain("Write the full report in English.");
    expect(prompt).toContain("# Situation Report: [crisis/event] - [location]");
    expect(prompt).toContain("## Highlights");
    expect(prompt).toContain("## Situation overview");
    expect(prompt).toContain("## Humanitarian impact and needs");
    expect(prompt).toContain("## Response");
    expect(prompt).toContain("## Gaps and constraints");
    expect(prompt).toContain("## Key figures");
    expect(prompt).toContain("## Outlook and priorities");
    expect(prompt).toContain("## Source coverage");
    expect(prompt).toContain("alpha.pdf");
    expect(prompt).toContain("beta.csv");
  });

  it("guards against unsupported facts", () => {
    const prompt = buildSummaryInstructions(["source.docx"]);

    expect(prompt).toContain("Do not invent locations, dates, figures");
    expect(prompt).toContain("Information not available in the uploaded documents.");
    expect(prompt).toContain("not an official UNOCHA publication");
  });

  it("can request Central Thai output", () => {
    const prompt = buildSummaryInstructions(["source.docx"], "Central Thai");

    expect(prompt).toContain("Write the full report in Central Thai.");
  });
});
