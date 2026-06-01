import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

describe("Home", () => {
  const originalCreateElement = document.createElement.bind(document);
  const saveMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    saveMock.mockReset();
    vi.doMock("html2canvas", () => ({
      default: vi.fn().mockResolvedValue({
        width: 100,
        height: 100,
        toDataURL: () => "data:image/png;base64,test"
      })
    }));
    vi.doMock("jspdf", () => ({
      jsPDF: vi.fn().mockImplementation(() => ({
        internal: {
          pageSize: {
            getWidth: () => 595,
            getHeight: () => 842
          }
        },
        addImage: vi.fn(),
        addPage: vi.fn(),
        save: saveMock
      }))
    }));
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);

      if (tagName.toLowerCase() === "canvas") {
        Object.defineProperty(element, "getContext", {
          configurable: true,
          value: () => ({
            fillStyle: "",
            fillRect: vi.fn(),
            drawImage: vi.fn()
          })
        });
        Object.defineProperty(element, "toDataURL", {
          configurable: true,
          value: () => "data:image/png;base64,page"
        });
      }

      return element;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("does not show an error before the user acts", () => {
    render(<Home />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toHaveValue("English");
    expect(screen.getByRole("option", { name: "English" })).toHaveTextContent("🇺🇸");
    expect(screen.getByRole("option", { name: "Central Thai" })).toHaveTextContent("🇹🇭");
    expect(screen.getByRole("button", { name: /generate sitrep/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeDisabled();
  });

  it("translates page text when Central Thai is selected", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.selectOptions(screen.getByLabelText("Language"), "Central Thai");

    expect(screen.getByRole("heading", { name: "รายงานสถานการณ์ UNOCHA" })).toBeInTheDocument();
    expect(screen.getByText("อัปโหลดเอกสารทั้งหมดเพื่อสร้างรายงานสถานการณ์")).toBeInTheDocument();
    expect(screen.getByText("วางไฟล์ที่นี่หรือเลือกไฟล์")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /สร้างรายงานสถานการณ์/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /ดาวน์โหลด pdf/i })).toBeDisabled();
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
    expect(screen.getByRole("button", { name: /ดาวน์โหลด pdf/i })).toBeEnabled();
  });

  it("renders key figures as a formatted table", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          summary:
            "# Situation Report: Test Event - Test Location\n\n## Key figures\n| Indicator | Latest figure | Date or reporting period | Source | |---|---:|---|---| | Displaced residents | 21,000-26,000 | 14 Sept 2027 | [S2] | | Power outages | 52,400 customers | 14 Sept 2027 | [S2] |",
          fileCount: 1,
          totalBytes: 5,
          language: "English",
          model: "test-model"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const { container } = render(<Home />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["hello"], "notes.txt", { type: "text/plain" }));
    await user.click(screen.getByRole("button", { name: /generate sitrep/i }));

    const table = await screen.findByRole("table");
    expect(table).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Indicator" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Displaced residents" })).toBeInTheDocument();
    expect(within(table).getAllByRole("row")).toHaveLength(3);
  });

  it("requires human review confirmation before downloading the PDF", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          summary: "# Situation Report: Test Event - Test Location\nThe files describe a focused plan.",
          fileCount: 1,
          totalBytes: 5,
          language: "English",
          model: "test-model"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const { container } = render(<Home />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, new File(["hello"], "notes.txt", { type: "text/plain" }));
    await user.click(screen.getByRole("button", { name: /generate sitrep/i }));
    await screen.findByRole("heading", { name: "Situation Report: Test Event - Test Location" });

    await user.click(screen.getByRole("button", { name: /download pdf/i }));

    expect(screen.getByRole("dialog", { name: "Confirm human review" })).toBeInTheDocument();
    expect(saveMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog", { name: "Confirm human review" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /download pdf/i }));
    await user.click(screen.getByRole("button", { name: "Confirm and download" }));

    await waitFor(() => expect(saveMock).toHaveBeenCalledWith(expect.stringMatching(/^unocha-sitrep-/)));
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
