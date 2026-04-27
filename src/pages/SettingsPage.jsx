import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦", path: "/dashboard" },
  { id: "upload", label: "Upload", icon: "⤴", path: "/upload" },
  { id: "files", label: "My Files", icon: "🗂", path: "/files" },
  { id: "settings", label: "Settings", icon: "⚙", path: "/settings" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayName, setDisplayName] = useState("Kavin s");
  const [email, setEmail] = useState("kavinsiva7770@gmail.com");
  const [alerts, setAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  function saveProfile(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("Profile settings saved.");
  }

  function resetPassword(event) {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please fill all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatusMessage("Password reset successful.");
  }

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
                      item.id === "settings" ? "bg-indigo-500/20 text-white" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-indigo-400 transition ${
                        item.id === "settings" ? "opacity-100" : "opacity-0"
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
                      item.id === "settings" ? "bg-indigo-500/20 text-white" : "bg-white/5 text-slate-200"
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
              <h1 className="text-xl font-semibold">Settings</h1>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
                {showDropdown && (
                  <div className="absolute right-0 top-11 w-40 rounded-xl border border-white/10 bg-slate-800 p-2">
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

          <section className="mx-auto w-full max-w-3xl space-y-5 p-5">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
              <h2 className="text-lg font-semibold">Manage your profile and preferences.</h2>
              <form onSubmit={saveProfile} className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Display name</span>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-300/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-300/50"
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={alerts}
                    onChange={(e) => setAlerts(e.target.checked)}
                  />
                  Email alerts for upload status
                </label>
                <div>
                  <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400">
                    Save Settings
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-5">
              <h2 className="text-lg font-semibold">Reset password</h2>
              <form onSubmit={resetPassword} className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Current password</span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-300/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-300/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm text-slate-300">Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm outline-none focus:border-indigo-300/50"
                  />
                </label>
                <div>
                  <button className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium hover:bg-purple-400">
                    Reset Password
                  </button>
                </div>
              </form>
            </div>

            {statusMessage && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                {statusMessage}
              </p>
            )}
            {errorMessage && (
              <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
                {errorMessage}
              </p>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
