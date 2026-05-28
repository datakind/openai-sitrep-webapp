"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Loader2, Plus, Send, Trash2, UploadCloud } from "lucide-react";
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
  }
> = {
  English: {
    eyebrow: "Document synthesis",
    title: "UNOCHA SitRep",
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
    languageLabel: "Language"
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
    languageLabel: "ภาษา"
  }
};

type SummaryResponse = {
  summary: string;
  fileCount: number;
  totalBytes: number;
  language: OutputLanguage;
  model: string;
};

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          {summary && (
            <span className="model-pill">
              {summary.fileCount} files via {summary.model}
            </span>
          )}
        </div>

        {isSubmitting && (
          <div className="summary-placeholder">
            <Loader2 aria-hidden="true" className="spin" size={22} />
            {copy.loading}
          </div>
        )}

        {!isSubmitting && summary && (
          <article className="markdown-body">
            <ReactMarkdown>{summary.summary}</ReactMarkdown>
          </article>
        )}

        {!isSubmitting && !summary && (
          <div className="summary-placeholder">
            {copy.placeholder}
          </div>
        )}
      </section>
    </main>
  );
}
