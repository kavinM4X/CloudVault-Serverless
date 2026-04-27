import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  deleteFile,
  deleteSelectedFiles,
  fetchFiles,
  filterFiles,
  paginateFiles,
  searchFiles,
  sortFiles,
} from "../services/files";
import { formatDate, formatFileSize } from "../services/dashboard";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "upload", label: "Upload", icon: "⤴", path: "/upload" },
  { id: "files", label: "My Files", icon: "🗂", path: "/files" },
  { id: "settings", label: "Settings", icon: "⚙", path: "/settings" },
];

export default function MyFilesPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("files");
  const [showDropdown, setShowDropdown] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [fadeContent, setFadeContent] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchFiles();
      setAllFiles(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const result = sortFiles(filterFiles(searchFiles(allFiles, query), filter), sortKey);
    return result;
  }, [allFiles, filter, query, sortKey]);

  const perPage = viewMode === "grid" ? 8 : 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageFiles = useMemo(
    () => paginateFiles(filtered, page > totalPages ? totalPages : page, perPage),
    [filtered, page, perPage, totalPages]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function toggleView(mode) {
    setFadeContent(true);
    setTimeout(() => {
      setViewMode(mode);
      setPage(1);
      setFadeContent(false);
    }, 250);
  }

  function navigateToDetail(fileId) {
    navigate(`/files/${fileId}`);
  }

  async function onDelete(fileId) {
    setDeletingId(fileId);
    await deleteFile(fileId);
    setAllFiles((prev) => prev.filter((file) => file.id !== fileId));
    setSelectedIds((prev) => prev.filter((id) => id !== fileId));
    setDeletingId("");
  }

  async function onConfirmDeleteSelected() {
    await deleteSelectedFiles(selectedIds);
    setAllFiles((prev) => prev.filter((file) => !selectedIds.includes(file.id)));
    setSelectedIds([]);
    setShowConfirmModal(false);
  }

  function onChangeFilter(nextFilter) {
    setFadeContent(true);
    setTimeout(() => {
      setFilter(nextFilter);
      setPage(1);
      setFadeContent(false);
    }, 250);
  }

  function onChangeSort(nextSort) {
    setFadeContent(true);
    setTimeout(() => {
      setSortKey(nextSort);
      setFadeContent(false);
    }, 250);
  }

  function onChangePage(nextPage) {
    setFadeContent(true);
    setTimeout(() => {
      setPage(nextPage);
      setFadeContent(false);
    }, 250);
  }

  const emptyMessage = getEmptyMessage(filter, query, allFiles.length);

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
                    onClick={() => {
                      setActiveNav(item.id);
                      navigate(item.path);
                    }}
                    className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      activeNav === item.id ? "bg-indigo-500/20 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400 transition ${
                        activeNav === item.id ? "opacity-100" : "opacity-0"
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
                      setActiveNav(item.id);
                      setMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`rounded-lg px-3 py-2 text-left text-sm ${
                      activeNav === item.id ? "bg-indigo-500/20 text-white" : "bg-white/5 text-slate-200"
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

          <section className="p-5">
            <div className="animate-header-down flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">My Files</h1>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs text-indigo-200">
                  {filtered.length}
                </span>
              </div>
              <button
                onClick={() => navigate("/upload")}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium hover:opacity-90 sm:w-auto"
              >
                Upload New
              </button>
            </div>

            <div className="animate-controls-in mt-4 flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">🔎</span>
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search files..."
                  className="my-files-search rounded-xl border border-white/10 bg-slate-800 py-2 pl-9 pr-9 text-sm outline-none transition focus:border-indigo-300/40"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 animate-clear-fade"
                  >
                    ×
                  </button>
                )}
              </div>

              <select
                value={filter}
                onChange={(e) => onChangeFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none sm:w-auto"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="pdfs">PDFs</option>
                <option value="documents">Documents</option>
                <option value="others">Others</option>
              </select>

              <select
                value={sortKey}
                onChange={(e) => onChangeSort(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm outline-none sm:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="largest">Largest</option>
                <option value="smallest">Smallest</option>
                <option value="name">A→Z Name</option>
              </select>

              <div className="relative flex rounded-xl bg-slate-800 p-1">
                <span
                  className="absolute top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-lg bg-indigo-500/60 transition-transform"
                  style={{ transform: `translateX(${viewMode === "grid" ? "0%" : "100%"})` }}
                />
                <button
                  onClick={() => toggleView("grid")}
                  className="relative z-10 rounded-lg px-3 py-1.5 text-sm"
                >
                  ⬚
                </button>
                <button
                  onClick={() => toggleView("list")}
                  className="relative z-10 rounded-lg px-3 py-1.5 text-sm"
                >
                  ☰
                </button>
              </div>
            </div>

            <div className={`mt-5 transition-opacity duration-300 ${fadeContent ? "opacity-0" : "opacity-100"}`}>
              {loading ? (
                <SkeletonBlocks mode={viewMode} />
              ) : pageFiles.length === 0 ? (
                <EmptyState
                  message={emptyMessage}
                  query={query}
                  filter={filter}
                  onUpload={() => navigate("/upload")}
                />
              ) : viewMode === "grid" ? (
                <GridView files={pageFiles} deletingId={deletingId} onDelete={onDelete} onView={navigateToDetail} />
              ) : (
                <ListView
                  files={pageFiles}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  deletingId={deletingId}
                  onDelete={onDelete}
                  onView={navigateToDetail}
                />
              )}
            </div>

            {!loading && filtered.length > 0 && (
              <Pagination current={page} total={totalPages} onChange={onChangePage} />
            )}
          </section>
        </main>
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-white/15 bg-slate-800 px-3 py-2 shadow-xl animate-bulk-bar">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white"
          >
            Delete Selected ({selectedIds.length})
          </button>
          <button className="rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white">
            Download Selected
          </button>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-800 p-5 animate-modal-in">
            <h3 className="text-lg font-semibold">Confirm deletion</h3>
            <p className="mt-2 text-sm text-slate-300">
              Delete {selectedIds.length} selected file(s)? This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDeleteSelected}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GridView({ files, deletingId, onDelete, onView }) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {files.map((file, idx) => (
        <article
          key={file.id}
          style={{ animationDelay: `${idx * 60}ms` }}
          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-4 transition hover:-translate-y-1.5 hover:shadow-2xl animate-file-in ${
            deletingId === file.id ? "animate-delete-out" : ""
          }`}
        >
          <div className={`text-center text-5xl ${fileTypeColor(file.type)}`}>{fileTypeIcon(file.type)}</div>
          <p className="mt-3 truncate text-sm font-medium">{file.name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {formatFileSize(file.size)} • {formatDate(file.date)}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs ${
              file.status === "Processed"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-yellow-500/20 text-yellow-300"
            }`}
          >
            {file.status}
          </span>
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-slate-900/90 p-3 transition duration-200 group-hover:translate-y-0">
            <div className="flex gap-2">
              <button onClick={() => onView(file.id)} className="flex-1 rounded-lg bg-indigo-500 px-2 py-1.5 text-xs">
                View
              </button>
              <button
                onClick={() => onDelete(file.id)}
                className="flex-1 rounded-lg bg-red-500/80 px-2 py-1.5 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ListView({ files, selectedIds, setSelectedIds, deletingId, onDelete, onView }) {
  function toggle(id, checked) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-800/60">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="p-3">Checkbox</th>
            <th className="p-3">Icon</th>
            <th className="p-3">File Name</th>
            <th className="p-3">Type</th>
            <th className="p-3">Size</th>
            <th className="p-3">Date</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              className={`group border-t border-white/5 transition hover:bg-white/5 ${
                deletingId === file.id ? "animate-delete-out" : ""
              }`}
            >
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(file.id)}
                  onChange={(e) => toggle(file.id, e.target.checked)}
                />
              </td>
              <td className={`p-3 text-lg ${fileTypeColor(file.type)}`}>{fileTypeIcon(file.type)}</td>
              <td className="p-3">{file.name}</td>
              <td className="p-3 capitalize">{file.type}</td>
              <td className="p-3">{formatFileSize(file.size)}</td>
              <td className="p-3">{formatDate(file.date)}</td>
              <td className="p-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    file.status === "Processed"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {file.status}
                </span>
              </td>
              <td className="p-3">
                <div className="flex gap-2">
                  <button onClick={() => onView(file.id)} className="rounded-lg border border-white/10 px-2 py-1 text-xs">
                    View
                  </button>
                  <button onClick={() => onDelete(file.id)} className="rounded-lg bg-red-500/80 px-2 py-1 text-xs">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="mt-5 flex items-center justify-start gap-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm"
      >
        Previous
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            current === p ? "bg-indigo-500 scale-105" : "border border-white/10"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm"
      >
        Next
      </button>
    </div>
  );
}

function SkeletonBlocks({ mode }) {
  const count = mode === "grid" ? 8 : 6;
  return (
    <div className={mode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4" : "space-y-3"}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`rounded-2xl bg-slate-700/70 animate-skeleton-shimmer ${
            mode === "grid" ? "h-44" : "h-12"
          }`}
        />
      ))}
    </div>
  );
}

function EmptyState({ message, query, filter, onUpload }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-10 text-center animate-empty-in">
      <svg className="mx-auto h-20 w-20 text-slate-500" viewBox="0 0 64 64" fill="none">
        <path d="M8 18h20l6 6h22v24a6 6 0 01-6 6H14a6 6 0 01-6-6V18z" stroke="currentColor" strokeWidth="3" />
        <path d="M32 31v10m0 8h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <p className="mt-4 text-lg font-semibold">No files found</p>
      <p className="mt-1 text-sm text-slate-300">
        {query
          ? `No results for '${query}'. Try a different name.`
          : filter !== "all"
          ? `No ${filter} files uploaded yet.`
          : message}
      </p>
      {!query && filter === "all" && (
        <button
          onClick={onUpload}
          className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm"
        >
          Upload File
        </button>
      )}
    </div>
  );
}

function fileTypeIcon(type) {
  const map = { pdf: "📕", image: "🖼", document: "📘", text: "📄", other: "🧾" };
  return map[type] || "📁";
}

function fileTypeColor(type) {
  const map = {
    pdf: "text-red-400",
    image: "text-blue-400",
    document: "text-indigo-400",
    text: "text-slate-300",
    other: "text-orange-400",
  };
  return map[type] || "text-slate-300";
}

function getEmptyMessage(filter, query, totalAll) {
  if (query) return "No matching files";
  if (filter !== "all") return `No ${filter} files uploaded yet.`;
  if (totalAll === 0) return "You haven't uploaded anything yet.";
  return "No files found.";
}
