# How To Use The SitRep Summary App

This guide explains how to set up and operate the SitRep Summary App from start to finish.

The app runs locally in your browser. It lets you upload a batch of documents, sends those documents to OpenAI through a server-side API route, and returns one draft UNOCHA-style Situation Report summary.

## 1. Before You Start

You need:

- Node.js and npm installed.
- An OpenAI API key.
- Source documents you want summarized into one Situation Report.
- Access to this project folder.

The app does not include user accounts, upload history, a database, or cloud storage. Files are handled for the current request only.

## 2. Install The App

From the project folder, install dependencies:

```bash
npm install
```

You only need to do this once, or again after dependencies change.

## 3. Configure OpenAI

Create a local environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

Notes:

- `OPENAI_API_KEY` is required.
- `OPENAI_MODEL` is optional.
- If `OPENAI_MODEL` is not set, the app defaults to `gpt-5.5`.
- `.env.local` should stay local and should not be committed to Git.

Restart the server any time you change `.env.local`.

## 4. Start The App

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already in use, Next.js may offer another local port. Use the URL shown in the terminal.

## 5. Prepare Your Documents

Use files that contain the information you want reflected in the final Situation Report.

Supported file types:

- PDF
- Word
- PowerPoint
- Plain text
- Markdown
- JSON
- CSV
- TSV
- Excel

Upload limits:

- Each file must be under 50 MB.
- The total selected upload batch must be under 50 MB.

Tips for better results:

- Upload the newest reports or assessments when available.
- Include source files that contain dates, locations, figures, and operational updates.
- Avoid duplicate files unless they contain meaningful differences.
- Remove unrelated files before generating the report.
- If documents conflict, the prompt asks the model to prioritize newer data and flag discrepancies.

## 6. Choose The Output Language

Use the flag picker in the upper-right corner.

Available options:

- English
- Central Thai

Changing the language clears any existing generated summary. Generate the SitRep again after changing languages.

## 7. Upload Files

You can add files in either of two ways:

- Drag files into the upload area.
- Click **Add files** and select files from your computer.

After adding files, the app shows:

- Number of selected files.
- Combined upload size.
- A list of selected filenames.
- File sizes.
- A remove button for each file.

If you select an unsupported or oversized file, the app displays a validation error before submitting.

## 8. Generate The SitRep

Click **Generate SitRep**.

The app will:

1. Validate the file selection.
2. Send the files to the local server route.
3. Send the files from the server to OpenAI.
4. Ask OpenAI to synthesize one Situation Report across the full upload batch.
5. Display the generated Markdown report in the output panel.

During generation, the button and output panel show a loading state.

## 9. Understand The Generated Output

The generated Situation Report is prompted to include:

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

The model is instructed to:

- Use only the uploaded documents as sources.
- Cite factual claims and figures with source labels such as `[S1]` and `[S2]`.
- Prefer newer data when documents overlap.
- Include a references list by uploaded filename.
- Note conflicts, stale data, weak evidence, or source limitations.
- Make clear the output is a draft and not an official UNOCHA publication.

## 10. Review The Report

Always review the generated report before using or sharing it.

Check that:

- The crisis/event and location are correct.
- The reporting period is accurate.
- Figures match the source documents.
- Citations appear on factual claims and figures.
- The inline graph uses cited data.
- Older data is not presented as newer data.
- Discrepancies or uncertainty are called out clearly.
- The references section includes the uploaded documents used.

If something looks wrong, revise the uploaded document set and generate the SitRep again.

## 11. Download A PDF

After a summary is generated, the **Download PDF** button becomes available.

To export:

1. Click **Download PDF**.
2. Read the confirmation popup.
3. Confirm that a human has reviewed and approved the summary.
4. The browser downloads the report as a PDF.

The confirmation step exists because generated reports should be reviewed before distribution.

## 12. Common Errors

### No Files Selected

Add at least one supported file before generating a SitRep.

### Unsupported File Type

The file extension is not accepted by the app. Convert the document to a supported format or remove it.

### File Too Large

Remove or reduce files until each file is under 50 MB and the total batch is under 50 MB.

### Missing API Key

Set `OPENAI_API_KEY` in `.env.local`, then restart the server.

### OpenAI API Error

Possible causes:

- Invalid API key.
- Model unavailable to the account.
- Network issue.
- Unsupported file content.
- Request too large.

Check the browser error message and terminal logs for details.

### PDF Button Disabled

Generate a SitRep first. PDF export is disabled until the app has a successful summary.

## 13. Developer Commands

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run linting:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 14. Operational Notes

- The app is designed for local use.
- Uploaded files are not saved as app history.
- The OpenAI API key is used server-side only.
- The output is a draft synthesis, not an official humanitarian product.
- Human review is required before using the generated report operationally.
