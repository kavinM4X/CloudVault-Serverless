import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [flashInvalid, setFlashInvalid] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadFailed, setUploadFailed] = useState(false);
  const fileInputRef = useRef(null);
  const progressTimerRef = useRef(null);
  const navigate = useNavigate();

  function handleDragEnter(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
    setIsDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "File type not supported" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File exceeds 10MB limit" };
    }
    return { valid: true, error: "" };
  }

  function readFilePreview(file) {
    if (!file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    setIsReading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreviewUrl(evt.target?.result || "");
      setIsReading(false);
    };
    reader.onerror = () => {
      setPreviewUrl("");
      setIsReading(false);
    };
    reader.readAsDataURL(file);
  }

  async function uploadFile(file) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const shouldFail = Math.random() < 0.15;
    if (shouldFail) {
      return { success: false, s3Key: "" };
    }
    return {
      success: true,
      s3Key: `uploads/${Date.now()}-${file.name.replace(/\s+/g, "-").toLowerCase()}`,
    };
  }

  function simulateProgress() {
    clearInterval(progressTimerRef.current);
    setProgress(0);
    let value = 0;
    progressTimerRef.current = setInterval(() => {
      value += 2;
      setProgress(Math.min(value, 100));
      if (value >= 100) clearInterval(progressTimerRef.current);
    }, 40);
  }

  function resetUpload() {
    clearInterval(progressTimerRef.current);
    setIsDragging(false);
    setIsDragOver(false);
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
    setFlashInvalid(false);
    setIsReading(false);
    setIsUploading(false);
    setProgress(0);
    setUploadResult(null);
    setUploadFailed(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function processFile(file) {
    setError("");
    setUploadFailed(false);
    setUploadResult(null);
    const result = validateFile(file);
    if (!result.valid) {
      setError(result.error);
      setFlashInvalid(true);
      setTimeout(() => setFlashInvalid(false), 450);
      return;
    }
    setSelectedFile(file);
    readFilePreview(file);
  }

  async function onUpload() {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setUploadFailed(false);
    setUploadResult(null);
    simulateProgress();

    const result = await uploadFile(selectedFile);
    if (result.success) {
      try {
        const payload = {
          fileId: `file-${Date.now()}`,
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSizeBytes: selectedFile.size,
          s3Bucket: "serverless-file-upload-cloudvault",
          s3Key: result.s3Key,
          status: "Processed",
          uploadedBy: "kavin",
          uploadedAt: new Date().toISOString(),
        };
        const created = await api.createFile(payload);
        const accepted =
          created &&
          typeof created === "object" &&
          (created.fileId || created.id || created.success);
        if (!accepted) {
          throw new Error("Backend did not store metadata.");
        }
        setProgress(100);
        setUploadResult(result);
      } catch {
        setUploadFailed(true);
        setError("Upload metadata save failed. Please try again.");
      }
    } else {
      setUploadFailed(true);
      setError("Upload Failed. Please try again.");
    }
    setIsUploading(false);
  }

  const zoneClasses = useMemo(() => {
    const base =
      "relative h-[300px] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden";
    if (flashInvalid) {
      return `${base} border-red-400 bg-red-500/10 animate-zone-shake`;
    }
    if (isDragging) {
      return `${base} border-indigo-500 bg-indigo-500/10 animate-zone-pulse`;
    }
    return `${base} border-slate-500/40 bg-slate-800/60 hover:border-indigo-400/60`;
  }, [flashInvalid, isDragging]);

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-[700px]">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 text-sm text-indigo-300 transition hover:text-indigo-200"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/files")}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
          >
            My Files
          </button>
        </div>
        <h1 className="text-3xl font-bold">Upload Files</h1>
        <p className="mt-2 text-sm text-slate-300">
          Securely upload your files to S3 with live progress and validation.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
          onChange={handleFileSelect}
        />

        <div
          className={`${zoneClasses} mt-6`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/20 rounded-2xl animate-dash-move" />
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className={`transition-transform duration-300 ${
                isDragging ? "scale-125" : "scale-100"
              } animate-cloud-bob`}
            >
              <UploadCloudIllustration />
            </div>
            <p className="mt-4 text-lg font-medium">
              {isDragOver ? (
                <span className="animate-release-text">Release to Upload</span>
              ) : (
                "Drag & Drop your file here"
              )}
            </p>
            <p className="mt-1 text-sm text-slate-300">or click to browse</p>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm text-red-100 animate-error-slide">
            {error}
          </div>
        )}

        {selectedFile && (
          <div
            className={`relative mt-5 rounded-2xl border border-white/10 bg-slate-800/80 p-4 animate-preview-in ${
              isReading ? "animate-card-shimmer" : ""
            }`}
          >
            <button
              type="button"
              onClick={resetUpload}
              className="absolute right-3 top-3 h-7 w-7 rounded-full bg-white/10 text-sm transition hover:rotate-90 hover:bg-white/20"
            >
              ×
            </button>
            <div className="flex items-start gap-4">
              <div className={`text-4xl ${fileColorClass(selectedFile.type)}`}>
                {fileIcon(selectedFile.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{selectedFile.name}</p>
                <p className="mt-1 text-xs text-slate-300">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || "unknown"}
                </p>
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-[100px] w-[100px] rounded-xl object-cover"
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          {!isUploading && !uploadResult && !uploadFailed && (
            <RippleButton
              onClick={onUpload}
              disabled={!selectedFile}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 font-semibold transition-all hover:scale-[1.02] hover:shadow-[0_12px_30px_-12px_rgba(99,102,241,0.8)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload File
            </RippleButton>
          )}

          {(isUploading || uploadResult || uploadFailed) && (
            <div className="rounded-xl border border-white/10 bg-slate-800/80 p-4">
              <div className="h-8 overflow-hidden rounded-lg bg-slate-700">
                <div
                  className={`relative flex h-full items-center justify-center text-sm font-medium transition-all duration-200 ${
                    uploadResult
                      ? "bg-emerald-500"
                      : uploadFailed
                      ? "bg-red-500"
                      : "bg-indigo-500"
                  }`}
                  style={{ width: `${progress}%` }}
                >
                  {!uploadResult && !uploadFailed && (
                    <span className="absolute inset-0 animate-progress-shimmer" />
                  )}
                  <span className="relative z-10">{Math.round(progress)}%</span>
                </div>
              </div>

              {uploadResult && (
                <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-9 w-9"
                      viewBox="0 0 52 52"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="4"
                    >
                      <circle
                        cx="26"
                        cy="26"
                        r="24"
                        stroke="#4ade8055"
                        strokeWidth="3"
                      />
                      <path
                        d="M14 27 L22 35 L38 19"
                        className="animate-check-path"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-emerald-300">
                        File Uploaded Successfully!
                      </p>
                      <p className="text-sm text-emerald-100">{selectedFile?.name}</p>
                      <p className="text-xs text-emerald-200/90">
                        S3 key: {uploadResult.s3Key}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={resetUpload}
                      className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                    >
                      Upload Another
                    </button>
                    <button
                      onClick={() => navigate("/files")}
                      className="rounded-lg bg-emerald-500/80 px-3 py-2 text-sm hover:bg-emerald-500"
                    >
                      View My Files
                    </button>
                  </div>
                  <ConfettiBurst />
                </div>
              )}

              {uploadFailed && (
                <div className="mt-4 rounded-xl border border-red-300/30 bg-red-500/10 p-4 animate-error-slide">
                  <p className="text-sm text-red-200">Upload Failed. Please try again.</p>
                  <button
                    onClick={onUpload}
                    className="mt-3 rounded-lg bg-red-500/80 px-3 py-2 text-sm hover:bg-red-500"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fileIcon(type) {
  if (type.includes("pdf")) return "📕";
  if (type.includes("wordprocessingml")) return "📘";
  if (type.includes("image")) return "🖼";
  if (type.includes("text")) return "📄";
  return "📁";
}

function fileColorClass(type) {
  if (type.includes("pdf")) return "text-red-400";
  if (type.includes("wordprocessingml")) return "text-blue-400";
  if (type.includes("image")) return "text-green-400";
  if (type.includes("text")) return "text-slate-300";
  return "text-indigo-300";
}

function RippleButton({ children, onClick, disabled, className }) {
  const [ripple, setRipple] = useState(null);

  function createRipple(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    setRipple({
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size,
      key: Date.now(),
    });
    setTimeout(() => setRipple(null), 550);
  }

  return (
    <button
      disabled={disabled}
      onClick={(e) => {
        createRipple(e);
        onClick?.();
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {ripple && (
        <span
          key={ripple.key}
          className="absolute rounded-full bg-white/40 animate-ripple pointer-events-none"
          style={{
            width: ripple.size,
            height: ripple.size,
            left: ripple.x,
            top: ripple.y,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function ConfettiBurst() {
  const items = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="pointer-events-none relative mt-1 h-0">
      {items.map((item) => (
        <span
          key={item}
          className="absolute left-1/2 top-0 h-2 w-2 animate-confetti"
          style={{
            backgroundColor: randomColor(item),
            "--x": `${(item % 5) * 24 - 48}px`,
            "--y": `${Math.floor(item / 5) * -22 - 20}px`,
            animationDelay: `${item * 20}ms`,
          }}
        />
      ))}
    </div>
  );
}

function randomColor(index) {
  const colors = ["#f43f5e", "#f59e0b", "#10b981", "#60a5fa", "#a78bfa"];
  return colors[index % colors.length];
}

function UploadCloudIllustration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 100"
      width="120"
      height="100"
      className="mx-auto"
    >
      <g>
        <circle cx="45" cy="58" r="22" fill="#7EC8E3" stroke="#5AAAC0" strokeWidth="1.5" />
        <circle cx="65" cy="52" r="26" fill="#7EC8E3" stroke="#5AAAC0" strokeWidth="1.5" />
        <circle cx="83" cy="60" r="18" fill="#7EC8E3" stroke="#5AAAC0" strokeWidth="1.5" />
        <rect x="38" y="58" width="63" height="22" rx="0" fill="#7EC8E3" />
        <rect x="34" y="74" width="72" height="8" rx="4" fill="#7EC8E3" stroke="#5AAAC0" strokeWidth="1.5" />
        <path
          d="M38 78 Q36 68 45 58 Q48 38 65 44 Q70 30 85 42 Q100 42 101 60 Q108 62 101 78 Z"
          fill="#7EC8E3"
          stroke="#5AAAC0"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      <g transform="translate(28, 38)" stroke="#A0A0A8" strokeWidth="2" strokeLinecap="round">
        <line x1="0" y1="-13" x2="0" y2="-9" />
        <line x1="0" y1="9" x2="0" y2="13" />
        <line x1="-13" y1="0" x2="-9" y2="0" />
        <line x1="9" y1="0" x2="13" y2="0" />
        <line x1="-9.2" y1="-9.2" x2="-6.4" y2="-6.4" />
        <line x1="6.4" y1="6.4" x2="9.2" y2="9.2" />
        <line x1="9.2" y1="-9.2" x2="6.4" y2="-6.4" />
        <line x1="-6.4" y1="6.4" x2="-9.2" y2="9.2" />
      </g>

      <circle cx="28" cy="38" r="7" fill="#C8C8D0" stroke="#A0A0A8" strokeWidth="1.5" />
      <circle cx="28" cy="38" r="4" fill="#E0E0E8" stroke="#A0A0A8" strokeWidth="1" />

      <g transform="translate(68, 62)">
        <g fill="#909098" stroke="#707078" strokeWidth="0.8">
          <rect x="-4" y="-17" width="8" height="6" rx="1" />
          <rect x="-4" y="11" width="8" height="6" rx="1" />
          <rect x="-17" y="-4" width="6" height="8" rx="1" />
          <rect x="11" y="-4" width="6" height="8" rx="1" />
          <rect x="7" y="-16" width="6" height="8" rx="1" transform="rotate(45 10 -12)" />
          <rect x="-13" y="8" width="6" height="8" rx="1" transform="rotate(45 -10 12)" />
          <rect x="-16" y="-13" width="8" height="6" rx="1" transform="rotate(45 -12 -10)" />
          <rect x="8" y="9" width="8" height="6" rx="1" transform="rotate(45 12 12)" />
        </g>
        <circle r="13" fill="#A0A0A8" stroke="#808088" strokeWidth="1.5" />
        <circle r="8" fill="#C8C8D0" stroke="#909098" strokeWidth="1" />
        <circle r="4" fill="#E8E8F0" stroke="#A0A0A8" strokeWidth="1" />
      </g>
    </svg>
  );
}
