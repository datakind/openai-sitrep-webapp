# SitRep Summary App

A local Next.js app for uploading multiple source documents and generating one draft UNOCHA-style Situation Report summary with OpenAI.

The app accepts a batch of files, sends them from a server-only API route to the OpenAI Responses API, and displays a synthesized Situation Report. Uploaded files are kept temporary for the request only; the app does not save upload history or write source files to disk.

## What It Does

- Upload multiple documents in one batch.
- Generate one combined Situation Report, not separate per-file summaries.
- Prioritize more recent information when documents overlap.
- Cite facts and figures using source labels such as `[S1]`, `[S2]`, and list references by filename.
- Include key figures and an inline graph visualization when supported by uploaded data.
- Switch output language between English and Central Thai.
- Download the generated report as a PDF after confirming human review.

## Supported Files

The upload form accepts these document types:

- PDF
- Word documents
- PowerPoint presentations
- Plain text and Markdown
- JSON
- CSV and TSV
- Excel workbooks

Limits:

- Each file must be under 50 MB.
- The combined upload batch must be under 50 MB.
- Empty uploads and unsupported extensions are rejected before submission.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Set your OpenAI API key in `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

`OPENAI_MODEL` is optional. If it is not set, the server uses `gpt-5.5`.

## Run Locally

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## How To Use The App

1. Choose the output language from the flag picker in the upper-right corner.
2. Drag files into the upload area, or click **Add files**.
3. Review the selected-file list and remove any files you do not want included.
4. Click **Generate SitRep**.
5. Wait for the server to process the files and return the Situation Report.
6. Review the generated report carefully.
7. Click **Download PDF**.
8. Confirm that a human has reviewed and approved the summary.
9. Save the generated PDF from the browser download flow.

## Output Format

The generated report is prompted to follow this general structure:

- Situation Report title
- Reporting period
- Highlights
- Situation overview
- Humanitarian impact and needs
- Response
- Gaps and constraints
- Key figures with an inline graph
- Outlook and priorities
- Discrepancies or confidence notes
- References

All factual claims and figures should be cited from the uploaded documents. The result is a draft generated from source material and is not an official UNOCHA publication.

## Security And Privacy Notes

- `OPENAI_API_KEY` is read only on the server and is never exposed to the browser.
- Uploaded files are sent to the server for the current request and then discarded.
- The app does not include login, a database, upload history, or cloud storage.
- Users should review all generated content before sharing or exporting it.

## Troubleshooting

### Missing API Key

If the app reports that `OPENAI_API_KEY` is not configured, check `.env.local` and restart the dev server.

### Unsupported File Type

Confirm the file extension is one of the supported types listed above.

### Upload Too Large

Remove files until each individual file is under 50 MB and the total selected batch is under 50 MB.

### OpenAI API Error

Check that your API key is valid, the model name is available to your account, and the uploaded files are supported by OpenAI file inputs.

### PDF Download Is Disabled

Generate a SitRep first. The PDF button is enabled only after a successful summary response.

## Developer Commands

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Start the production server after a build:

```bash
npm start
```
