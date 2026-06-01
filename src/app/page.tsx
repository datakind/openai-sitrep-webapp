"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Download, FileText, Loader2, Plus, Send, Trash2, UploadCloud } from "lucide-react";
import { acceptedFileInputValue, formatBytes, MAX_TOTAL_BYTES, validateFiles } from "@/lib/fileValidation";
import { OutputLanguage, SUPPORTED_OUTPUT_LANGUAGES } from "@/lib/summaryPrompt";

const LANGUAGE_FLAGS: Record<OutputLanguage, string> = {
  English: "🇺🇸",
  "Central Thai": "🇹🇭"
};

const COPY: Record<
  OutputLanguage,
  {
    eyebrow: string;
    title: string;
    intro: string;
    drop: string;
    types: string;
    addFiles: string;
    noFiles: string;
    fileCount: (count: number) => string;
    removeFile: (name: string) => string;
    submit: string;
    submitting: string;
    output: string;
    summary: string;
    loading: string;
    placeholder: string;
    languageLabel: string;
    downloadPdf: string;
    downloadingPdf: string;
    downloadUnavailable: string;
    downloadFailed: string;
    reviewTitle: string;
    reviewBody: string;
    reviewCancel: string;
    reviewConfirm: string;
  }
> = {
  English: {
    eyebrow: "Document synthesis",
    title: "SitRep Summary",
    intro: "Upload all documents to generate your SitRep",
    drop: "Drop files here or browse",
    types: "PDF, Word, PowerPoint, text, Markdown, JSON, CSV, TSV, and Excel.",
    addFiles: "Add files",
    noFiles: "No files selected yet.",
    fileCount: (count) => `${count} ${count === 1 ? "file" : "files"}`,
    removeFile: (name) => `Remove ${name}`,
    submit: "Generate SitRep",
    submitting: "Generating SitRep",
    output: "Output",
    summary: "Summary",
    loading: "Reading the uploaded files and preparing the brief.",
    placeholder: "Your Situation Report will appear here after the upload is processed.",
    languageLabel: "Language",
    downloadPdf: "Download PDF",
    downloadingPdf: "Preparing PDF",
    downloadUnavailable: "Generate a Situation Report before downloading a PDF.",
    downloadFailed: "Unable to create the PDF. Please try again.",
    reviewTitle: "Confirm human review",
    reviewBody:
      "Before downloading, confirm that a human has reviewed and approved this Situation Report summary.",
    reviewCancel: "Cancel",
    reviewConfirm: "Confirm and download"
  },
  "Central Thai": {
    eyebrow: "การสังเคราะห์เอกสาร",
    title: "รายงานสถานการณ์ UNOCHA",
    intro: "อัปโหลดเอกสารทั้งหมดเพื่อสร้างรายงานสถานการณ์",
    drop: "วางไฟล์ที่นี่หรือเลือกไฟล์",
    types: "รองรับ PDF, Word, PowerPoint, ข้อความ, Markdown, JSON, CSV, TSV และ Excel",
    addFiles: "เพิ่มไฟล์",
    noFiles: "ยังไม่ได้เลือกไฟล์",
    fileCount: (count) => `${count} ไฟล์`,
    removeFile: (name) => `ลบ ${name}`,
    submit: "สร้างรายงานสถานการณ์",
    submitting: "กำลังสร้างรายงาน",
    output: "ผลลัพธ์",
    summary: "สรุป",
    loading: "กำลังอ่านไฟล์ที่อัปโหลดและจัดทำรายงาน",
    placeholder: "รายงานสถานการณ์ของคุณจะแสดงที่นี่หลังจากประมวลผลการอัปโหลดแล้ว",
    languageLabel: "ภาษา",
    downloadPdf: "ดาวน์โหลด PDF",
    downloadingPdf: "กำลังเตรียม PDF",
    downloadUnavailable: "โปรดสร้างรายงานสถานการณ์ก่อนดาวน์โหลด PDF",
    downloadFailed: "ไม่สามารถสร้าง PDF ได้ โปรดลองอีกครั้ง",
    reviewTitle: "ยืนยันการตรวจสอบโดยมนุษย์",
    reviewBody:
      "ก่อนดาวน์โหลด โปรดยืนยันว่ามีมนุษย์ตรวจสอบและอนุมัติสรุปรายงานสถานการณ์นี้แล้ว",
    reviewCancel: "ยกเลิก",
    reviewConfirm: "ยืนยันและดาวน์โหลด"
  }
};

type SummaryResponse = {
  summary: string;
  fileCount: number;
  totalBytes: number;
  language: OutputLanguage;
  model: string;
};

function normalizeMarkdownTables(markdown: string) {
  return markdown.replace(/\|\s+\|/g, "|\n|");
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReviewConfirmOpen, setIsReviewConfirmOpen] = useState(false);
  const [language, setLanguage] = useState<OutputLanguage>("English");

  const validation = useMemo(() => validateFiles(files), [files]);
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const canSubmit = validation.errors.length === 0 && files.length > 0 && !isSubmitting;
  const visibleErrors = [...new Set([...errors, ...(files.length > 0 ? validation.errors : [])])];
  const copy = COPY[language];

  function addFiles(incoming: FileList | File[]) {
    const merged = [...files, ...Array.from(incoming)];
    setFiles(merged);
    setErrors(validateFiles(merged).errors);
    setSummary(null);
  }

  function removeFile(index: number) {
    const nextFiles = files.filter((_, currentIndex) => currentIndex !== index);
    setFiles(nextFiles);
    setErrors(validateFiles(nextFiles).errors);
    setSummary(null);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = "";
    }
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
      addFiles(event.dataTransfer.files);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextValidation = validateFiles(files);
    if (nextValidation.errors.length > 0 || files.length === 0) {
      setErrors(nextValidation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);
    setSummary(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("language", language);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        body: formData
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors([payload.error || "Unable to summarize the selected files."]);
        return;
      }

      setSummary(payload);
    } catch (error) {
      setErrors([
        error instanceof Error
          ? `Unable to reach the summary service: ${error.message}`
          : "Unable to reach the summary service."
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestDownloadPdf() {
    if (!summary || !reportRef.current) {
      setErrors([copy.downloadUnavailable]);
      return;
    }

    setErrors([]);
    setIsReviewConfirmOpen(true);
  }

  async function handleDownloadPdf() {
    if (!summary || !reportRef.current) {
      setErrors([copy.downloadUnavailable]);
      setIsReviewConfirmOpen(false);
      return;
    }

    setIsReviewConfirmOpen(false);
    setIsDownloading(true);
    setErrors([]);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf")
      ]);
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const imageWidth = pageWidth - margin * 2;
      const pageImageHeight = pageHeight - margin * 2;
      const sliceHeight = Math.floor((pageImageHeight * canvas.width) / imageWidth);
      let sourceY = 0;

      while (sourceY < canvas.height) {
        if (sourceY > 0) {
          pdf.addPage();
        }

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sliceHeight, canvas.height - sourceY);
        const context = pageCanvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas rendering is unavailable.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          pageCanvas.height,
          0,
          0,
          canvas.width,
          pageCanvas.height
        );

        const imageData = pageCanvas.toDataURL("image/png");
        const renderedHeight = (pageCanvas.height * imageWidth) / pageCanvas.width;
        pdf.addImage(imageData, "PNG", margin, margin, imageWidth, renderedHeight);
        sourceY += sliceHeight;
      }

      pdf.save(`unocha-sitrep-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch {
      setErrors([copy.downloadFailed]);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="app-shell">
      <label className="language-picker">
        <span className="sr-only">{copy.languageLabel}</span>
        <select
          value={language}
          aria-label={copy.languageLabel}
          title={copy.languageLabel}
          onChange={(event) => {
            setLanguage(event.target.value as OutputLanguage);
            setSummary(null);
          }}
        >
          {SUPPORTED_OUTPUT_LANGUAGES.map((option) => (
            <option key={option} value={option} aria-label={option}>
              {LANGUAGE_FLAGS[option]}
            </option>
          ))}
        </select>
      </label>

      <section className="workspace" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="page-title">{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>

        <form className="upload-panel" onSubmit={handleSubmit}>
          <label
            className={isDragging ? "drop-zone drop-zone-active" : "drop-zone"}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={acceptedFileInputValue()}
              onChange={handleInputChange}
            />
            <UploadCloud aria-hidden="true" size={34} />
            <span>{copy.drop}</span>
            <small>{copy.types}</small>
          </label>

          <div className="toolbar">
            <div>
              <span className="metric">{copy.fileCount(files.length)}</span>
              <span className={totalBytes > MAX_TOTAL_BYTES ? "metric metric-danger" : "metric"}>
                {formatBytes(totalBytes)} / 50 MB
              </span>
            </div>
            <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>
              <Plus aria-hidden="true" size={18} />
              {copy.addFiles}
            </button>
          </div>

          {files.length > 0 ? (
            <ul className="file-list" aria-label="Selected files">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`}>
                  <FileText aria-hidden="true" size={20} />
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatBytes(file.size)}</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removeFile(index)}
                    aria-label={copy.removeFile(file.name)}
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">{copy.noFiles}</div>
          )}

          {visibleErrors.length > 0 && (
            <div className="error-list" role="alert">
              {visibleErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <button className="primary-button" type="submit" disabled={!canSubmit}>
            {isSubmitting ? <Loader2 aria-hidden="true" className="spin" size={18} /> : <Send aria-hidden="true" size={18} />}
            {isSubmitting ? copy.submitting : copy.submit}
          </button>
        </form>
      </section>

      <section className="summary-panel" aria-labelledby="summary-title">
        <div className="summary-header">
          <div>
            <p className="eyebrow">{copy.output}</p>
            <h2 id="summary-title">{copy.summary}</h2>
          </div>
          <div className="summary-actions">
            {summary && (
              <span className="model-pill">
                {summary.fileCount} files via {summary.model}
              </span>
            )}
            <button
              type="button"
              className="download-button"
              onClick={requestDownloadPdf}
              disabled={!summary || isDownloading}
            >
              {isDownloading ? (
                <Loader2 aria-hidden="true" className="spin" size={17} />
              ) : (
                <Download aria-hidden="true" size={17} />
              )}
              {isDownloading ? copy.downloadingPdf : copy.downloadPdf}
            </button>
          </div>
        </div>

        {isSubmitting && (
          <div className="summary-placeholder">
            <Loader2 aria-hidden="true" className="spin" size={22} />
            {copy.loading}
          </div>
        )}

        {!isSubmitting && summary && (
          <article className="markdown-body" ref={reportRef}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizeMarkdownTables(summary.summary)}</ReactMarkdown>
          </article>
        )}

        {!isSubmitting && !summary && (
          <div className="summary-placeholder">
            {copy.placeholder}
          </div>
        )}
      </section>

      {isReviewConfirmOpen && (
        <div className="modal-backdrop" role="presentation">
          <div
            className="confirmation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-confirm-title"
            aria-describedby="review-confirm-body"
          >
            <h2 id="review-confirm-title">{copy.reviewTitle}</h2>
            <p id="review-confirm-body">{copy.reviewBody}</p>
            <div className="dialog-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setIsReviewConfirmOpen(false)}
              >
                {copy.reviewCancel}
              </button>
              <button type="button" className="primary-dialog-button" onClick={handleDownloadPdf}>
                <Download aria-hidden="true" size={17} />
                {copy.reviewConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
