import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { deleteFile, downloadFile, fetchFileById } from "../services/files";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "upload", label: "Upload", icon: "⤴", path: "/upload" },
  { id: "files", label: "My Files", icon: "🗂", path: "/files" },
  { id: "settings", label: "Settings", icon: "⚙", path: "/settings" },
];

export default function FileDetailPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadState, setDownloadState] = useState("idle");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchFileById(fileId);
      setFile(data);
      setLoading(false);
    }
    load();
  }, [fileId]);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function onDownload() {
    if (!file || downloadState === "downloading") return;
    setDownloadState("downloading");
    await downloadFile(file.id);
    setDownloadState("done");
    setTimeout(() => setDownloadState("idle"), 1700);
  }

  function closeModal() {
    setClosingModal(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setClosingModal(false);
    }, 200);
  }

  async function onConfirmDelete() {
    if (!file) return;
    setDeleting(true);
    await deleteFile(file.id);
    setDeleted(true);
    setTimeout(() => navigate("/files"), 450);
  }

  const maskedS3 = useMemo(() => {
    if (!file?.s3Key) return "";
    if (file.s3Key.length <= 26) return file.s3Key;
    return `${file.s3Key.slice(0, 20)}...${file.s3Key.slice(-3)}`;
  }, [file?.s3Key]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-900 text-slate-100">
      <div className="min-h-screen lg:flex">
        <aside
          className={`hidden border-r border-white/10 bg-slate-900/95 transition-all duration-300 lg:block ${
            collapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="flex h-full flex-col justify-between p-4">
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrandLogo className="h-9 w-9" />
                  {!collapsed && <span className="text-sm font-semibold">Serverless</span>}
                </div>
                <button
                  onClick={() => setCollapsed((prev) => !prev)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
                >
                  {collapsed ? "→" : "←"}
                </button>
              </div>
              <nav className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      item.id === "files" ? "bg-indigo-500/20 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400 transition ${
                        item.id === "files" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </nav>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                {!collapsed && (
                  <div>
                    <p className="text-sm font-medium">Kavin</p>
                    <p className="text-xs text-slate-400">Cloud Engineer</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <button
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-lg border border-red-300/20 bg-red-500/10 py-1.5 text-xs text-red-200 hover:bg-red-500/20"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </aside>

        <main className="w-full flex-1">
          <div className="border-b border-white/10 bg-slate-900/90 px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandLogo className="h-8 w-8" />
                <span className="text-sm font-semibold">Serverless</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="rounded-lg border border-white/15 px-2 py-1 text-xs"
              >
                {mobileMenuOpen ? "Close" : "Menu"}
              </button>
            </div>
            {mobileMenuOpen && (
              <nav className="mt-3 grid gap-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`rounded-lg px-3 py-2 text-left text-sm ${
                      item.id === "files" ? "bg-indigo-500/20 text-white" : "bg-white/5 text-slate-200"
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search files, uploads, logs..."
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm outline-none transition focus:border-indigo-300/40"
                />
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
                {showDropdown && (
                  <div className="absolute right-0 top-11 w-40 rounded-xl border border-white/10 bg-slate-800 p-2 animate-dropdown-in">
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10">
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className={`p-5 transition-all duration-300 ${deleted ? "scale-90 opacity-0" : "scale-100 opacity-100"}`}>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <Link className="hover:underline" to="/dashboard">
                Dashboard
              </Link>
              <span>›</span>
              <Link className="hover:underline" to="/files">
                My Files
              </Link>
              <span>›</span>
              <span className="text-slate-500">{file?.name || "File Detail"}</span>
            </div>

            <button
              onClick={() => navigate("/files")}
              className="group inline-flex items-center gap-1.5 text-sm text-indigo-300 transition hover:text-indigo-200"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              <span>Back to My Files</span>
            </button>

            {loading || !file ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-800/60 p-8 text-sm text-slate-300">
                Loading file details...
              </div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-5">
                <section className="animate-detail-left rounded-2xl border border-white/10 bg-slate-800/60 p-6 lg:col-span-2">
                  <div className="overflow-hidden rounded-xl bg-slate-900/50 p-4">
                    {file.type === "image" && file.previewUrl ? (
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        onLoad={() => setImageLoaded(true)}
                        className={`mx-auto h-[260px] w-full rounded-xl object-cover transition-all duration-300 hover:scale-105 ${
                          imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ) : (
                      <div className={`mx-auto flex h-[260px] items-center justify-center text-[120px] ${getFileTypeColor(file.type)}`}>
                        {getFileTypeIcon(file.type)}
                      </div>
                    )}
                  </div>

                  <p className="mt-4 truncate text-xl font-semibold">{file.name}</p>
                  <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getFileTypePill(file.type)}`}>
                    {file.mime?.split("/")[1]?.toUpperCase() || file.type.toUpperCase()}
                  </span>
                </section>

                <section className="animate-detail-right rounded-2xl border border-white/10 bg-slate-800/60 p-6 lg:col-span-3">
                  <h2 className="text-lg font-semibold">File Information</h2>
                  <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-slate-900/30">
                    {metaRows(file, maskedS3).map((row, idx) => (
                      <div
                        key={row.label}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        className="animate-meta-row flex items-start justify-between gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2 text-slate-300">
                          <span>{row.icon}</span>
                          <span>{row.label}</span>
                        </div>
                        {row.label === "S3 Storage Key" ? (
                          <div className="relative flex items-center gap-2 text-right text-slate-200">
                            <span className="font-mono text-xs">{row.value}</span>
                            <button
                              onClick={() => copyToClipboard(file.s3Key)}
                              className="rounded p-1 hover:bg-white/10"
                              title="Copy S3 key"
                            >
                              <span className={`inline-block transition ${copied ? "scale-110 text-emerald-300" : ""}`}>
                                {copied ? "✓" : "📋"}
                              </span>
                            </button>
                            {copied && (
                              <span className="absolute -top-7 right-0 rounded bg-slate-950 px-2 py-1 text-xs text-emerald-200 animate-tooltip-fade">
                                Copied!
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-right text-slate-200">{row.value}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <StatusBadge status={file.status} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={onDownload}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                        downloadState === "done"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                      }`}
                    >
                      <span className={downloadState === "downloading" ? "animate-download-bounce" : ""}>⬇</span>
                      {downloadState === "idle" && "Download"}
                      {downloadState === "downloading" && "Downloading..."}
                      {downloadState === "done" && "Downloaded ✓"}
                    </button>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="rounded-xl border border-rose-400/70 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-600 hover:text-white"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </section>
              </div>
            )}
          </section>
        </main>
      </div>

      {showDeleteModal && (
        <div className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm ${closingModal ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in"}`}>
          <div className={`w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-5 ${closingModal ? "animate-modal-out" : "animate-modal-in"}`}>
            <div className="text-3xl">⚠</div>
            <h3 className="mt-2 text-lg font-semibold">Are you sure?</h3>
            <p className="mt-1 text-sm text-slate-300">
              This will delete <span className="font-medium text-white">{file?.name}</span>.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white hover:bg-rose-500"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFileTypeColor(type) {
  const map = {
    pdf: "text-red-400",
    image: "text-blue-400",
    document: "text-indigo-400",
    text: "text-slate-300",
    other: "text-orange-400",
  };
  return map[type] || "text-slate-300";
}

function getFileTypePill(type) {
  const map = {
    pdf: "bg-red-500/20 text-red-200",
    image: "bg-blue-500/20 text-blue-200",
    document: "bg-indigo-500/20 text-indigo-200",
    text: "bg-slate-500/20 text-slate-200",
    other: "bg-orange-500/20 text-orange-200",
  };
  return map[type] || "bg-slate-500/20 text-slate-200";
}

function getFileTypeIcon(type) {
  const map = { pdf: "📕", image: "🖼", document: "📘", text: "📄", other: "🧾" };
  return map[type] || "📁";
}

function metaRows(file, maskedS3) {
  return [
    { icon: "📁", label: "File Name", value: file.name },
    { icon: "📊", label: "File Size", value: formatFileSize(file.size) },
    { icon: "🗂️", label: "File Type", value: file.mime },
    { icon: "📅", label: "Uploaded On", value: formatDate(file.date) },
    { icon: "👤", label: "Uploaded By", value: file.uploadedBy },
    { icon: "☁️", label: "S3 Storage Key", value: maskedS3 },
    { icon: "🔄", label: "Processing Status", value: file.status },
  ];
}

function StatusBadge({ status }) {
  if (status === "Pending") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-yellow-500/20 px-4 py-2 text-yellow-200 animate-pending-pulse">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-yellow-200/50 border-t-yellow-100" />
        <span>⏳ Pending</span>
      </div>
    );
  }
  if (status === "Failed") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl bg-rose-500/20 px-4 py-2 text-rose-200">
        <span>❌</span>
        <span>Failed</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 text-emerald-200">
      <span className="animate-check-in">✅</span>
      <span>Processed</span>
    </div>
  );
}
