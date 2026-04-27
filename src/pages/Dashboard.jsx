import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import {
  fetchDashboardStats,
  fetchRecentFiles,
  formatDate,
  formatFileSize,
} from "../services/dashboard";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "upload", label: "Upload", icon: "⤴", path: "/upload" },
  { id: "files", label: "My Files", icon: "🗂", path: "/files" },
  { id: "settings", label: "Settings", icon: "⚙", path: "/settings" },
];

const ACTIVITY = [
  { id: 1, text: "Lambda processed 8 files", at: "2 min ago", icon: "⚡" },
  { id: 2, text: "S3 bucket sync completed", at: "11 min ago", icon: "☁" },
  { id: 3, text: "New file uploaded by user", at: "23 min ago", icon: "⬆" },
];

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [stats, setStats] = useState({
    totalFiles: 0,
    storageUsed: 0,
    lastUpload: "",
  });
  const [displayStats, setDisplayStats] = useState({ totalFiles: 0, storageUsed: 0 });
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [shakeBell, setShakeBell] = useState(false);
  const navigate = useNavigate();
  const userName = "Kavin";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [nextStats, nextFiles] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentFiles(),
      ]);
      setStats(nextStats);
      setRecentFiles(nextFiles);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const duration = 1500;
    const tickRate = 30;
    const steps = Math.floor(duration / tickRate);
    let index = 0;
    const totalFilesStep = stats.totalFiles / steps || 0;
    const storageStep = stats.storageUsed / steps || 0;

    const timer = setInterval(() => {
      index += 1;
      setDisplayStats({
        totalFiles: Math.min(Math.round(totalFilesStep * index), stats.totalFiles),
        storageUsed: Math.min(Number((storageStep * index).toFixed(1)), stats.storageUsed),
      });
      if (index >= steps) clearInterval(timer);
    }, tickRate);
    return () => clearInterval(timer);
  }, [stats.totalFiles, stats.storageUsed]);

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function onBellClick() {
    setShakeBell(true);
    setTimeout(() => setShakeBell(false), 450);
  }

  const statCards = useMemo(
    () => [
      {
        id: "files",
        title: "Total Files Uploaded",
        value: displayStats.totalFiles,
        suffix: "",
        icon: "📁",
        color: "from-indigo-500/20 to-indigo-600/20 border-indigo-400/30",
      },
      {
        id: "storage",
        title: "Total Storage Used (MB)",
        value: displayStats.storageUsed,
        suffix: " MB",
        icon: "🗄",
        color: "from-purple-500/20 to-purple-600/20 border-purple-400/30",
      },
      {
        id: "last",
        title: "Last Upload Date",
        value: stats.lastUpload ? formatDate(stats.lastUpload) : "--",
        suffix: "",
        icon: "🕒",
        color: "from-pink-500/20 to-pink-600/20 border-pink-400/30",
      },
    ],
    [displayStats.storageUsed, displayStats.totalFiles, stats.lastUpload]
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-900 text-slate-100">
      <div className="min-h-screen lg:flex">
        <aside
          className={`relative hidden border-r border-white/10 bg-slate-900/95 transition-all duration-300 lg:block ${
            collapsed ? "w-20" : "w-72"
          } animate-sidebar-in`}
        >
          <div className="flex h-full flex-col justify-between p-4">
            <div>
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrandLogo className="h-9 w-9" />
                  {!collapsed && (
                    <span className="text-sm font-semibold tracking-wide">Serverless</span>
                  )}
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
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      activeNav === item.id
                        ? "bg-indigo-500/20 text-white"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400 transition-all ${
                        activeNav === item.id ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-3">
              {!collapsed && (
                <button
                  onClick={() => navigate("/upload")}
                  className="group w-full rounded-xl border border-dashed border-indigo-300/30 bg-indigo-500/5 p-4 text-left transition hover:border-indigo-300/70 hover:bg-indigo-500/10"
                >
                  <p className="text-sm font-medium text-white">Quick Upload</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Drop file or click to upload
                  </p>
                </button>
              )}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  {!collapsed && (
                    <div>
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-slate-400">Cloud Engineer</p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-lg border border-red-300/20 bg-red-500/10 py-1.5 text-xs text-red-200 transition hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full flex-1 animate-main-fade">
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
              <div className="flex items-center gap-3">
                <button
                  onClick={onBellClick}
                  className={`rounded-xl border border-white/10 bg-slate-800 p-2.5 transition hover:bg-slate-700 ${
                    shakeBell ? "animate-bell-shake" : ""
                  }`}
                >
                  🔔
                </button>
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
            </div>
          </header>

          <div className="grid gap-6 p-5 xl:grid-cols-[1fr_320px]">
            <section>
              <h1 className="animate-greeting-fade text-2xl font-semibold">
                Good Morning, {userName} 👋
              </h1>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {statCards.map((card, idx) => (
                  <article
                    key={card.id}
                    style={{ animationDelay: `${idx * 150}ms` }}
                    className={`animate-stat-in rounded-2xl border bg-gradient-to-br p-5 transition hover:-translate-y-1 hover:shadow-2xl ${card.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-200">{card.title}</p>
                      <span className="text-lg">{card.icon}</span>
                    </div>
                    <p className="mt-4 text-2xl font-semibold">
                      {typeof card.value === "number" ? card.value : card.value}
                      {card.suffix}
                    </p>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Recent Uploads</h2>
                  <button
                    onClick={() => navigate("/files")}
                    className="text-sm text-indigo-300 hover:text-indigo-200"
                  >
                    View All →
                  </button>
                </div>

                {loading ? (
                  <p className="text-sm text-slate-400">Loading recent files...</p>
                ) : (
                  <div>
                    <div className="space-y-3 md:hidden">
                      {recentFiles.map((file, idx) => (
                        <article
                          key={file.id}
                          style={{ animationDelay: `${idx * 50}ms` }}
                          className="animate-row-in rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{file.name}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {formatFileSize(file.size)} • {formatDate(file.date)}
                              </p>
                            </div>
                            <span className="text-lg">{iconByType(file.type)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            {file.status === "Processed" ? (
                              <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300">
                                Processed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs text-yellow-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" />
                                Pending
                              </span>
                            )}
                            <button
                              onClick={() => navigate(`/files/${file.id}`)}
                              className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
                            >
                              View
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="text-slate-400">
                          <tr>
                            <th className="pb-3 font-medium">File Name</th>
                            <th className="pb-3 font-medium">Type Icon</th>
                            <th className="pb-3 font-medium">Size</th>
                            <th className="pb-3 font-medium">Date</th>
                            <th className="pb-3 font-medium">Status Badge</th>
                            <th className="pb-3 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentFiles.map((file, idx) => (
                            <tr
                              key={file.id}
                              className="animate-row-in border-t border-white/5 transition hover:bg-white/5"
                              style={{ animationDelay: `${idx * 50}ms` }}
                            >
                              <td className="py-3">{file.name}</td>
                              <td className="py-3">{iconByType(file.type)}</td>
                              <td className="py-3">{formatFileSize(file.size)}</td>
                              <td className="py-3">{formatDate(file.date)}</td>
                              <td className="py-3">
                                {file.status === "Processed" ? (
                                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300">
                                    Processed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs text-yellow-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" />
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => navigate(`/files/${file.id}`)}
                                  className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
                <h3 className="text-base font-semibold">Activity Feed</h3>
                <div className="mt-3 space-y-2">
                  {ACTIVITY.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{ animationDelay: `${idx * 90}ms` }}
                      className="animate-feed-in rounded-lg bg-white/5 p-3"
                    >
                      <p className="text-sm">
                        <span className="mr-2">{item.icon}</span>
                        {item.text}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{item.at}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function iconByType(type) {
  const map = {
    pdf: "📄",
    video: "🎬",
    image: "🖼",
    text: "📝",
    csv: "📊",
  };
  return map[type] || "📁";
}
