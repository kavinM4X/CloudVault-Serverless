const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function ensureBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not set. Add it to your .env file.");
  }
}

async function request(path, options = {}) {
  ensureBaseUrl();
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = {
    ...(options.headers || {}),
  };
  if (hasBody && !(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  });

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  // Support Lambda proxy responses that embed payload in "body".
  if (data && typeof data === "object" && typeof data.body === "string") {
    try {
      return JSON.parse(data.body);
    } catch {
      return data.body;
    }
  }

  return data;
}

export const api = {
  getDashboard: () => request("/dashboard"),
  getFiles: () => request("/files"),
  getFileById: (fileId) => request(`/files/${fileId}`),
  createFile: (payload) =>
    request("/files", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteFile: (fileId) =>
    request(`/files/${fileId}`, {
      method: "DELETE",
    }),
};
