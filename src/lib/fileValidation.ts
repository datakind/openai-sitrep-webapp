export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024;

export const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".rtf",
  ".odt",
  ".ppt",
  ".pptx",
  ".txt",
  ".md",
  ".markdown",
  ".json",
  ".html",
  ".xml",
  ".csv",
  ".tsv",
  ".xls",
  ".xlsx"
] as const;

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/html",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/csv",
  "text/tab-separated-values",
  "text/tsv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
] as const;

export type FileLike = {
  name: string;
  size: number;
  type?: string;
};

export type ValidationResult = {
  validFiles: FileLike[];
  errors: string[];
  totalBytes: number;
};

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function getFileExtension(name: string) {
  const dotIndex = name.lastIndexOf(".");
  return dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
}

export function isSupportedFile(file: FileLike) {
  const extension = getFileExtension(file.name);
  const mimeType = file.type?.toLowerCase() ?? "";

  return (
    SUPPORTED_EXTENSIONS.includes(extension as (typeof SUPPORTED_EXTENSIONS)[number]) ||
    SUPPORTED_MIME_TYPES.includes(mimeType as (typeof SUPPORTED_MIME_TYPES)[number])
  );
}

export function validateFiles(files: FileLike[]): ValidationResult {
  const errors: string[] = [];

  if (files.length === 0) {
    return {
      validFiles: [],
      errors: ["Choose at least one file to summarize."],
      totalBytes: 0
    };
  }

  const validFiles = files.filter((file) => {
    if (!isSupportedFile(file)) {
      errors.push(`${file.name} is not a supported file type.`);
      return false;
    }

    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name} is ${formatBytes(file.size)}; each file must be under 50 MB.`);
      return false;
    }

    if (file.size === 0) {
      errors.push(`${file.name} is empty.`);
      return false;
    }

    return true;
  });

  const totalBytes = validFiles.reduce((sum, file) => sum + file.size, 0);

  if (totalBytes > MAX_TOTAL_BYTES) {
    errors.push(`Selected files total ${formatBytes(totalBytes)}; the combined upload must be under 50 MB.`);
  }

  return {
    validFiles: totalBytes > MAX_TOTAL_BYTES ? [] : validFiles,
    errors,
    totalBytes
  };
}

export function acceptedFileInputValue() {
  return SUPPORTED_EXTENSIONS.join(",");
}
