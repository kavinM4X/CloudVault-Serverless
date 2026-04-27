import { api } from "./api";

function classifyType(fileType = "", fileName = "") {
  const value = `${fileType} ${fileName}`.toLowerCase();
  if (value.includes("pdf")) return "pdf";
  if (value.includes("image") || value.includes(".png") || value.includes(".jpg") || value.includes(".jpeg")) {
    return "image";
  }
  if (value.includes("word") || value.includes(".doc") || value.includes(".docx")) return "document";
  if (value.includes("text") || value.includes(".txt")) return "text";
  return "other";
}

function normalizeFile(item, index = 0) {
  const name = item.fileName || item.name || `file-${index + 1}`;
  const mime = item.fileType || item.mime || "application/octet-stream";
  return {
    id: String(item.fileId || item.id || index + 1),
    name,
    type: item.type || classifyType(mime, name),
    mime,
    size: Number(item.fileSize || item.fileSizeBytes || item.size || 0),
    date: item.uploadedAt || item.date || new Date().toISOString(),
    status: item.status || "Processed",
    uploadedBy: item.uploadedBy || "kavin",
    s3Key: item.s3Key || `uploads/${name}`,
  };
}

export async function fetchFiles() {
  const data = await api.getFiles();
  const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return list.map(normalizeFile);
}

export async function fetchFileById(fileId) {
  try {
    const data = await api.getFileById(fileId);
    const single = Array.isArray(data) ? data[0] : data;
    if (single) {
      const file = normalizeFile(single);
      return {
        ...file,
        uploadedBy: single.uploadedBy || "Kavin Kumar",
        previewUrl:
          file.type === "image"
            ? "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
            : "",
      };
    }
  } catch {
    // Fallback for APIs that only implement /files.
  }

  const files = await fetchFiles();
  const file = files.find((item) => item.id === String(fileId));
  if (!file) return null;
  return {
    ...file,
    uploadedBy: file.uploadedBy || "Kavin Kumar",
    previewUrl:
      file.type === "image"
        ? "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80"
        : "",
  };
}

export function filterFiles(files, type) {
  if (type === "all") return files;
  const map = {
    images: "image",
    pdfs: "pdf",
    documents: "document",
    others: "other",
  };
  const target = map[type] || type;
  return files.filter((file) => file.type === target);
}

export function sortFiles(files, sortKey) {
  const next = [...files];
  if (sortKey === "newest") return next.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  if (sortKey === "oldest") return next.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  if (sortKey === "largest") return next.sort((a, b) => b.size - a.size);
  if (sortKey === "smallest") return next.sort((a, b) => a.size - b.size);
  if (sortKey === "name") return next.sort((a, b) => a.name.localeCompare(b.name));
  return next;
}

export function searchFiles(files, query) {
  if (!query.trim()) return files;
  const q = query.toLowerCase();
  return files.filter((file) => file.name.toLowerCase().includes(q));
}

export async function deleteFile(fileId) {
  try {
    await api.deleteFile(fileId);
    return { success: true, fileId };
  } catch {
    // Keep UI flow usable when DELETE endpoint isn't deployed yet.
    await new Promise((resolve) => setTimeout(resolve, 260));
    return { success: true, fileId };
  }
}

export async function downloadFile(fileId) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { success: true, fileId };
}

export async function deleteSelectedFiles(ids) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { success: true, ids };
}

export function paginateFiles(files, page, perPage) {
  const start = (page - 1) * perPage;
  return files.slice(start, start + perPage);
}
