import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

describe("Home", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not show an error before the user acts", () => {
    render(<Home />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("English");
    expect(screen.getByRole("option", { name: "English" })).toHaveTextContent("🇺🇸");
    expect(screen.getByRole("option", { name: "Central Thai" })).toHaveTextContent("🇹🇭");
    expect(screen.getByRole("button", { name: /generate sitrep/i })).toBeDisabled();
  });

  it("translates page text when Central Thai is selected", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.selectOptions(screen.getByLabelText("Language"), "Central Thai");

    expect(screen.getByRole("heading", { name: "รายงานสถานการณ์ UNOCHA" })).toBeInTheDocument();
    expect(screen.getByText("อัปโหลดเอกสารทั้งหมดเพื่อสร้างรายงานสถานการณ์")).toBeInTheDocument();
    expect(screen.getByText("วางไฟล์ที่นี่หรือเลือกไฟล์")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /สร้างรายงานสถานการณ์/i })).toBeDisabled();
    expect(screen.getByText("รายงานสถานการณ์ของคุณจะแสดงที่นี่หลังจากประมวลผลการอัปโหลดแล้ว")).toBeInTheDocument();
  });

  it("adds and removes selected files", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    await user.upload(input, file);

    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(screen.getByText("1 file")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove notes\.txt/i }));

    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
    expect(screen.getByText("No files selected yet.")).toBeInTheDocument();
  });

  it("shows validation errors for unsupported files", async () => {
    render(<Home />);
    const dropZone = screen.getByText("Drop files here or browse").closest("label") as HTMLLabelElement;

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [new File(["image"], "image.png", { type: "image/png" })]
      }
    });

    expect(screen.getByRole("alert")).toHaveTextContent("image.png is not a supported file type.");
    expect(screen.getByRole("button", { name: /generate sitrep/i })).toBeDisabled();
  });

  it("submits files and renders the returned Markdown summary", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: "# Situation Report: Test Event - Test Location\nThe files describe a focused plan.\n\n## Highlights\n- Growth",
          fileCount: 1,
          totalBytes: 5,
          language: "Central Thai",
          model: "test-model"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const { container } = render(<Home />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["hello"], "notes.txt", { type: "text/plain" }));
    await user.selectOptions(screen.getByLabelText("Language"), "Central Thai");

    await user.click(screen.getByRole("button", { name: /สร้างรายงานสถานการณ์/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/summarize", expect.any(Object)));
    const formData = (fetchMock.mock.calls[0][1] as RequestInit).body as FormData;
    expect(formData.get("language")).toBe("Central Thai");
    expect(await screen.findByRole("heading", { name: "Situation Report: Test Event - Test Location" })).toBeInTheDocument();
    expect(screen.getByText("The files describe a focused plan.")).toBeInTheDocument();
    expect(screen.getByText("1 files via test-model")).toBeInTheDocument();
  });

  it("displays API errors from the server", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured on the server." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );

    const { container } = render(<Home />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["hello"], "notes.txt", { type: "text/plain" }));
    await user.click(screen.getByRole("button", { name: /generate sitrep/i }));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/OPENAI_API_KEY/)).toBeInTheDocument();
  });
});
