export const SUPPORTED_OUTPUT_LANGUAGES = ["English", "Central Thai"] as const;

export type OutputLanguage = (typeof SUPPORTED_OUTPUT_LANGUAGES)[number];

export function isOutputLanguage(value: FormDataEntryValue | null): value is OutputLanguage {
  return (
    typeof value === "string" &&
    SUPPORTED_OUTPUT_LANGUAGES.includes(value as OutputLanguage)
  );
}

export function buildSummaryInstructions(filenames: string[], language: OutputLanguage = "English") {
  const sourceList = filenames.map((name, index) => `[S${index + 1}] ${name}`).join("\n");

  return `You are an expert humanitarian information management officer. Read every uploaded file and synthesize the full batch into a UNOCHA-style Situation Report summary.

Write the full report in ${language}. Keep proper nouns, organization names, place names, technical acronyms, and figures faithful to the uploaded documents.

Create at least one simple graph visualization using only cited figures from the uploaded documents. Prefer the newest comparable figures, and place the graph inline inside the most relevant existing section instead of creating a separate visualization section.

Use the OCHA/UN humanitarian SitRep format as the model: concise title, reporting period, highlights, situation overview, impact/needs, operational response, access or constraints, key figures with an inline graph, outlook/priorities, data notes, and references.

Evidence and citation rules:
- Treat the uploaded documents as the only source of truth.
- Do not invent locations, dates, figures, sectors, agencies, funding amounts, casualties, displacement numbers, affected populations, response activities, or constraints.
- Every factual claim and every figure must include an inline citation to the uploaded document label, such as [S1] or [S2].
- If one sentence combines facts from multiple documents, cite every relevant source label at the end of the sentence.
- Prefer the most recent supported data when documents conflict or overlap; make newer data more prominent in Highlights, Situation overview, Key figures, and the inline graph.
- When older data provides useful trend or baseline context, include it only after the latest data and cite it clearly.
- If a section has no support in the uploaded documents, write "Information not available in the uploaded documents."
- Keep bullets to one sentence unless the evidence requires a short clarifying phrase.
- Make clear this is a draft generated from uploaded documents, not an official UNOCHA publication.

Return Markdown with exactly these sections:

# Situation Report: [crisis/event] - [location]
Use the most specific crisis/event and location supported by the files. If unknown, write "Situation Report: Unspecified Situation - Unspecified Location". Include a citation in the heading line if the crisis/event or location is derived from a document.

## Reporting period
State the reporting period, "as of" timestamp, or date range covered by the uploaded files. If multiple documents cover different periods, emphasize the most recent period first and mention older periods as context.

## Highlights
Provide 4-6 bullets with the most important operational developments, humanitarian impacts, response updates, access constraints, funding issues, or gaps. Lead with the newest and most operationally significant information.

## Situation overview
Summarize the current situation, geographic scope, affected population, severity, and recent developments in 1-3 short paragraphs. Prioritize the latest documents and use older documents only for trend or comparison.

## Humanitarian impact and needs
Use bullets grouped by available themes or sectors, such as displacement, protection, health, food security, WASH, shelter/NFI, education, logistics, or access. Include only needs and impacts supported by uploaded documents.

## Response
Use bullets grouped by responding actors, clusters/sectors, government, UN, NGOs, or other partners where that information is available.

## Gaps and constraints
Use bullets for unmet needs, operational constraints, access issues, funding gaps, data gaps, security constraints, or coordination issues.

## Key figures
Create a valid multi-line Markdown table with columns: Indicator, Latest figure, Date or reporting period, Source. Put the header row, separator row, and each data row on separate lines so the table renders properly. Include only figures supported by the uploaded files. Immediately below the table, include one inline graph using the most relevant comparable figures from the uploaded documents. Do not add a separate "Visualization" heading. Use a fenced code block with proportional bars, for example:

\`\`\`text
Affected people by area
Area A | ██████████ 100,000
Area B | ████ 40,000
\`\`\`

Immediately below the graph, add a cited note explaining the data source and date. If older documents contain comparable figures, add a short cited trend note below the graph.

## Outlook and priorities
Use bullets for likely near-term developments, priority actions, decisions needed, or follow-up information requirements.

## Discrepancies or confidence notes
Use bullets to list conflicting figures, inconsistent dates, duplicated claims, stale information, source limitations, or areas where the evidence is weak. If newer data supersedes older data, say so and cite both.

## References
List every uploaded document used in this format:
- [S1] Filename — one short phrase describing what it contributed.

Use this OCHA product intent: a Situation Report is a concise operational document that supports humanitarian coordination by updating readers on current needs, response, and gaps in an emergency.

Uploaded files:
${sourceList}`;
}
