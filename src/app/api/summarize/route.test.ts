import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn()
}));

vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    responses: {
      create: createMock
    }
  }))
}));

describe("POST /api/summarize", () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  beforeEach(() => {
    createMock.mockReset();
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "test-model";
  });

  function requestWithFormData(formData: FormData) {
    return {
      formData: async () => formData
    } as Request;
  }

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_MODEL = originalModel;
  });

  it("rejects requests when the API key is missing", async () => {
    process.env.OPENAI_API_KEY = "";
    const { POST } = await import("./route");
    const formData = new FormData();
    formData.append("files", new File(["hello"], "notes.txt", { type: "text/plain" }));

    const response = await POST(requestWithFormData(formData));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toContain("OPENAI_API_KEY");
  });

  it("rejects empty file selections", async () => {
    const { POST } = await import("./route");
    const response = await POST(requestWithFormData(new FormData()));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Choose at least one file");
  });

  it("sends uploaded files as Responses API input_file parts", async () => {
    createMock.mockResolvedValue({
      output_text: "# Situation Report: Test Event - Test Location\nA concise result."
    });

    const { POST } = await import("./route");
    const formData = new FormData();
    formData.append("files", new File(["alpha"], "alpha.txt", { type: "text/plain" }));
    formData.append("files", new File(["beta"], "beta.csv", { type: "text/csv" }));
    formData.append("language", "Central Thai");

    const response = await POST(requestWithFormData(formData));
    const payload = await response.json();
    const requestPayload = createMock.mock.calls[0][0];
    const content = requestPayload.input[0].content;

    expect(response.status).toBe(200);
    expect(payload.summary).toContain("Situation Report");
    expect(payload.fileCount).toBe(2);
    expect(payload.language).toBe("Central Thai");
    expect(requestPayload.model).toBe("test-model");
    expect(content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "input_file",
          filename: "alpha.txt",
          file_data: expect.stringContaining("data:text/plain;base64,")
        }),
        expect.objectContaining({
          type: "input_file",
          filename: "beta.csv",
          file_data: expect.stringContaining("data:text/csv;base64,")
        }),
        expect.objectContaining({
          type: "input_text",
          text: expect.stringContaining("Write the full report in Central Thai.")
        })
      ])
    );
  });

  it("rejects unsupported output languages", async () => {
    const { POST } = await import("./route");
    const formData = new FormData();
    formData.append("files", new File(["hello"], "notes.txt", { type: "text/plain" }));
    formData.append("language", "Klingon");

    const response = await POST(requestWithFormData(formData));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("supported output language");
  });

  it("returns a clear error when OpenAI fails", async () => {
    createMock.mockRejectedValue(new Error("rate limited"));

    const { POST } = await import("./route");
    const formData = new FormData();
    formData.append("files", new File(["hello"], "notes.txt", { type: "text/plain" }));
    formData.append("language", "English");

    const response = await POST(requestWithFormData(formData));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).toContain("rate limited");
  });
});
