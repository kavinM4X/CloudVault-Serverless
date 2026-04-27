import { api } from "./api";

function normalizeFile(item, index = 0) {
  return {
    id: String(item.id || item.fileId || index + 1),
    name: item.name || item.fileName || "untitled-file",
    type:
      item.type ||
      item.fileType?.split("/")?.[1] ||
      item.fileType ||
      "other",
    size: Number(item.size || item.fileSize || item.fileSizeBytes || 0),
    date: item.date || item.uploadedAt || new Date().toISOString(),
    status: item.status || "Processed",
  };
}

export async function fetchRecentFiles() {
  const data = await api.getFiles();
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return list.slice(0, 5).map(normalizeFile);
}

export async function fetchDashboardStats() {
  try {
    const data = await api.getDashboard();
    if (data && typeof data === "object") {
      return {
        totalFiles: Number(data.totalFiles || 0),
        storageUsed: Number(data.storageUsed || 0),
        lastUpload: data.lastUpload || "",
      };
    }
  } catch {
    // Fallback to calculating stats from files when /dashboard is unavailable.
  }

  const data = await api.getFiles();
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  const files = list.map(normalizeFile);
  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
  const sorted = [...files].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const lastUpload = sorted[0]?.date || "";
  return {
    totalFiles,
    storageUsed: Number((totalSizeBytes / (1024 * 1024)).toFixed(2)),
    lastUpload,
  };
}

export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(2)} KB`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}
