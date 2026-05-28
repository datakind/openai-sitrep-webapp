export const SUPPORTED_OUTPUT_LANGUAGES = ["English", "Central Thai"] as const;

export type OutputLanguage = (typeof SUPPORTED_OUTPUT_LANGUAGES)[number];

export function isOutputLanguage(value: FormDataEntryValue | null): value is OutputLanguage {
  return (
    typeof value === "string" &&
    SUPPORTED_OUTPUT_LANGUAGES.includes(value as OutputLanguage)
  );
}

export function buildSummaryInstructions(filenames: string[], language: OutputLanguage = "English") {
  const sourceList = filenames.map((name) => `- ${name}`).join("\n");

  return `You are an expert humanitarian information management officer. Read every uploaded file and synthesize the full batch into a UNOCHA-style Situation Report.

Write the full report in ${language}. Keep proper nouns, organization names, place names, technical acronyms, and figures faithful to the uploaded documents.

Write in a factual, concise humanitarian reporting voice. Do not invent locations, dates, figures, sectors, agencies, funding amounts, casualties, displacement numbers, or response activities. If a section has no support in the uploaded documents, write "Information not available in the uploaded documents." Keep all bullets to one sentence unless the evidence requires a short clarifying phrase.

Return Markdown with exactly these sections:

# Situation Report: [crisis/event] - [location]
Use the most specific crisis/event and location supported by the files. If unknown, write "Situation Report: Unspecified Situation - Unspecified Location".

## Reporting period
State the reporting period or date range covered by the uploaded files. If unclear, say so.

## Highlights
Provide 2-5 bullets with the most important operational developments, impacts, response updates, or gaps.

## Situation overview
Summarize the current situation, geographic scope, affected population, severity, and recent developments in 1-3 short paragraphs.

## Humanitarian impact and needs
Use bullets grouped by available themes or sectors, such as displacement, protection, health, food security, WASH, shelter/NFI, education, logistics, or access.

## Response
Use bullets grouped by responding actors, clusters/sectors, government, UN, NGOs, or other partners where that information is available.

## Gaps and constraints
Use bullets for unmet needs, operational constraints, access issues, funding gaps, data gaps, security constraints, or coordination issues.

## Key figures
Create a Markdown table with columns: Indicator, Figure, Source or note. Include only figures supported by the uploaded files.

## Outlook and priorities
Use bullets for likely near-term developments, priority actions, decisions needed, or follow-up information requirements.

## Discrepancies or confidence notes
Use bullets to list conflicting figures, inconsistent dates, duplicated claims, stale information, or areas where the evidence is weak. If none are available, say so.

## Source coverage
List the uploaded filenames used and briefly state what each contributed. Do not provide separate full per-file summaries.

Use this OCHA product intent: a Situation Report is a concise operational document that supports humanitarian coordination by updating readers on current needs, response, and gaps in an emergency.

Make clear this is a draft generated from uploaded documents, not an official UNOCHA publication.

Uploaded files:
${sourceList}`;
}
