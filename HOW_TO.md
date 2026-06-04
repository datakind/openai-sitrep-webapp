# How To Use The SitRep Summary App

The SitRep Summary App helps you turn a set of source documents into one draft Situation Report summary. It is designed for users who need a concise, structured report based on multiple documents.

The app can summarize PDFs, Word documents, spreadsheets, text files, and other common document formats. The output should always be reviewed by a person before it is shared or used for decision-making.

## 1. When To Use This App

Use this app when you have several documents about the same emergency, operation, assessment, or response and want one consolidated Situation Report.

Good examples include:

- Situation updates
- Assessment reports
- Meeting notes
- Operational briefs
- Response plans
- Datasets or spreadsheets with key figures
- Public information updates

The app works best when the uploaded documents are related to the same context, location, or event.

## 2. Choose Your Documents

Before uploading, gather the documents that should inform the report.

Try to include:

- The most recent reports or updates.
- Documents with dates, locations, and key figures.
- Files that describe impacts, needs, response activities, gaps, and constraints.
- Any documents that explain differences between older and newer figures.

Avoid uploading:

- Unrelated files.
- Duplicate copies of the same document.
- Drafts that should not be used.
- Files that contain information you do not want considered in the summary.

## 3. Supported File Types

You can upload:

- PDF
- Word
- PowerPoint
- Text
- Markdown
- JSON
- CSV
- TSV
- Excel

Each file must be under 50 MB, and the full upload batch must also stay under 50 MB.

## 4. Select The Report Language

Use the flag picker in the upper-right corner of the page to choose the output language.

Available languages:

- English
- Central Thai

If you change the language after generating a report, generate the report again so the output matches your selected language.

## 5. Upload Files

You can upload files in two ways:

- Drag files into the upload area.
- Click **Add files** and choose files from your computer.

After files are added, the app shows:

- How many files are selected.
- The total upload size.
- The name of each selected file.
- The size of each selected file.

To remove a file, use the remove button next to that file before generating the report.

## 6. Generate The Situation Report

When your file list is ready, click **Generate SitRep**.

The app will read the uploaded documents and create one combined draft Situation Report. This may take a little time depending on the number and size of files.

While the report is being generated, the page shows a loading state. When the report is ready, it appears in the output panel on the right side of the page.

## 7. What The Report Includes

The generated report is designed to follow a Situation Report style. It may include:

- Title
- Reporting period
- Highlights
- Situation overview
- Humanitarian impact and needs
- Response
- Gaps and constraints
- Key figures
- An inline graph based on uploaded data
- Outlook and priorities
- Discrepancies or confidence notes
- References

The report should cite facts and figures using source labels such as `[S1]` and `[S2]`. The references section links those labels to the uploaded filenames.

## 8. Review The Report

Always review the report before using it.

Check that:

- The event, crisis, or location is correct.
- The reporting period is accurate.
- Key figures match the uploaded documents.
- Important claims include source citations.
- The graph is based on cited figures.
- Newer information is prioritized where documents overlap.
- Any conflicting or uncertain information is clearly noted.
- The references section includes the documents used.

If the report is missing important information, try adding more relevant source documents and generating it again.

If the report includes incorrect or unsupported information, remove unclear or unrelated files and regenerate the report.

## 9. Download The Report As A PDF

After a report has been generated, the **Download PDF** button becomes available.

To download:

1. Click **Download PDF**.
2. Confirm that a human has reviewed and approved the summary.
3. The report downloads as a PDF.

The confirmation step is intentional. Generated summaries should be reviewed before they are distributed.

## 10. Common Messages And What To Do

### No Files Selected

Add at least one file before clicking **Generate SitRep**.

### Unsupported File Type

Remove the unsupported file or convert it to a supported format.

### Upload Too Large

Remove files until the selected batch is under the size limit.

### Missing API Key

Ask the person responsible for running the app to check the app configuration.

### OpenAI API Error

Try again. If the error continues, ask the person responsible for running the app to check the app configuration, model access, or connection.

### PDF Button Is Disabled

Generate a report first. The PDF button is only available after a successful report is shown.

## 11. Good Practices

- Use the newest documents available.
- Keep each upload batch focused on one situation or emergency.
- Review citations carefully.
- Treat the generated output as a draft.
- Do not share the PDF until a person has reviewed and approved it.
- Regenerate the report if you add, remove, or change source documents.
