import { describe, expect, it } from "vitest";
import {
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  acceptedFileInputValue,
  formatBytes,
  isSupportedFile,
  validateFiles
} from "./fileValidation";

describe("file validation", () => {
  it("accepts common document formats", () => {
    expect(isSupportedFile({ name: "brief.pdf", size: 128, type: "application/pdf" })).toBe(true);
    expect(isSupportedFile({ name: "notes.md", size: 128, type: "" })).toBe(true);
    expect(isSupportedFile({ name: "model.xlsx", size: 128, type: "" })).toBe(true);
  });

  it("rejects unsupported formats", () => {
    const result = validateFiles([{ name: "photo.png", size: 128, type: "image/png" }]);

    expect(result.validFiles).toHaveLength(0);
    expect(result.errors).toContain("photo.png is not a supported file type.");
  });

  it("rejects empty selections", () => {
    expect(validateFiles([]).errors).toEqual(["Choose at least one file to summarize."]);
  });

  it("rejects files over the individual limit", () => {
    const result = validateFiles([{ name: "large.pdf", size: MAX_FILE_BYTES + 1, type: "application/pdf" }]);

    expect(result.validFiles).toHaveLength(0);
    expect(result.errors[0]).toContain("each file must be under 50 MB");
  });

  it("rejects selections over the combined limit", () => {
    const result = validateFiles([
      { name: "first.pdf", size: 26 * 1024 * 1024, type: "application/pdf" },
      { name: "second.pdf", size: 25 * 1024 * 1024, type: "application/pdf" }
    ]);

    expect(result.totalBytes).toBeGreaterThan(MAX_TOTAL_BYTES);
    expect(result.validFiles).toHaveLength(0);
    expect(result.errors[0]).toContain("combined upload must be under 50 MB");
  });

  it("formats bytes for the interface", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(10 * 1024 * 1024)).toBe("10 MB");
  });

  it("builds the file input accept value", () => {
    expect(acceptedFileInputValue()).toContain(".pdf");
    expect(acceptedFileInputValue()).toContain(".xlsx");
  });
});
