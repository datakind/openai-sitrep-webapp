import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSummaryInstructions, isOutputLanguage } from "@/lib/summaryPrompt";
import { validateFiles } from "@/lib/fileValidation";

export const runtime = "nodejs";

type InputFilePart = {
  type: "input_file";
  filename: string;
  file_data: string;
};

type InputTextPart = {
  type: "input_text";
  text: string;
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Upload must be sent as multipart form data." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((value): value is File => value instanceof File);
  const validation = validateFiles(files);

  if (validation.errors.length > 0 || validation.validFiles.length === 0) {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
  }

  const languageValue = formData.get("language");

  if (!isOutputLanguage(languageValue)) {
    return NextResponse.json(
      { error: "Choose a supported output language: English or Central Thai." },
      { status: 400 }
    );
  }

  try {
    const fileParts: InputFilePart[] = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const mimeType = file.type || "application/octet-stream";

        return {
          type: "input_file",
          filename: file.name,
          file_data: `data:${mimeType};base64,${base64}`
        };
      })
    );

    const promptPart: InputTextPart = {
      type: "input_text",
      text: buildSummaryInstructions(files.map((file) => file.name), languageValue)
    };

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: [
        {
          role: "user",
          content: [...fileParts, promptPart]
        }
      ]
    } as never);

    const summary = "output_text" in response ? response.output_text : "";

    if (!summary) {
      return NextResponse.json(
        { error: "OpenAI returned an empty summary. Try a smaller or clearer file set." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      summary,
      fileCount: files.length,
      totalBytes: validation.totalBytes,
      language: languageValue,
      model: process.env.OPENAI_MODEL || "gpt-5.5"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error.";

    return NextResponse.json(
      { error: `Unable to summarize the uploaded files: ${message}` },
      { status: 502 }
    );
  }
}
