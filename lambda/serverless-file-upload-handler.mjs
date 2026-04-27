import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const REGION = process.env.AWS_REGION || "ap-south-1";
const TABLE_NAME =
  process.env.TABLE_NAME || "serverless-file-upload-cloudvault-metadata";

const dynamo = new DynamoDBClient({ region: REGION });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
}

function fromAttr(value) {
  if (!value || typeof value !== "object") return null;
  if ("S" in value) return value.S;
  if ("N" in value) return Number(value.N);
  if ("BOOL" in value) return value.BOOL;
  if ("NULL" in value) return null;
  if ("M" in value) {
    const obj = {};
    for (const [key, nested] of Object.entries(value.M)) {
      obj[key] = fromAttr(nested);
    }
    return obj;
  }
  if ("L" in value) return value.L.map(fromAttr);
  return null;
}

function fromItem(item) {
  const plain = {};
  for (const [key, attr] of Object.entries(item || {})) {
    plain[key] = fromAttr(attr);
  }
  return plain;
}

function toAttr(value) {
  if (value === null || value === undefined) return { NULL: true };
  if (typeof value === "string") return { S: value };
  if (typeof value === "number") return { N: String(value) };
  if (typeof value === "boolean") return { BOOL: value };
  if (Array.isArray(value)) return { L: value.map(toAttr) };
  if (typeof value === "object") {
    const map = {};
    for (const [k, v] of Object.entries(value)) {
      map[k] = toAttr(v);
    }
    return { M: map };
  }
  return { S: String(value) };
}

function toFileDto(item) {
  const fileId = item.fileId || item.id;
  const fileName = item.fileName || item.name || "unknown-file";
  const fileType = item.fileType || "application/octet-stream";
  const uploadedAt = item.uploadedAt || new Date().toISOString();
  const fileSizeBytes = Number(item.fileSizeBytes || item.fileSize || 0);

  return {
    id: String(fileId),
    fileId: String(fileId),
    name: fileName,
    fileName,
    type: fileType,
    fileType,
    size: fileSizeBytes,
    fileSizeBytes,
    uploadedAt,
    uploadedBy: item.uploadedBy || "unknown",
    s3Bucket: item.s3Bucket || "",
    s3Key: item.s3Key || "",
    status: item.status || "Pending",
  };
}

function parseRoute(event) {
  const method = event?.requestContext?.http?.method || event?.httpMethod || "";
  const rawPath = event?.requestContext?.http?.path || event?.rawPath || event?.path || "";
  const path = rawPath.replace(/\/+$/, "") || "/";
  return { method: method.toUpperCase(), path };
}

async function listFiles() {
  const scan = await dynamo.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  const items = (scan.Items || []).map((item) => toFileDto(fromItem(item)));
  items.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
  return items;
}

async function getFileById(fileId) {
  const output = await dynamo.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: {
        fileId: { S: String(fileId) },
      },
    })
  );

  if (!output.Item) return null;
  return toFileDto(fromItem(output.Item));
}

async function removeFile(fileId) {
  await dynamo.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: {
        fileId: { S: String(fileId) },
      },
    })
  );
}

async function createFile(file) {
  const fileId = String(file.fileId || `file-${Date.now()}`);
  const item = {
    fileId,
    fileName: file.fileName || "unknown-file",
    fileType: file.fileType || "application/octet-stream",
    fileSizeBytes: Number(file.fileSizeBytes || 0),
    s3Bucket: file.s3Bucket || "",
    s3Key: file.s3Key || "",
    status: file.status || "Pending",
    uploadedBy: file.uploadedBy || "unknown",
    uploadedAt: file.uploadedAt || new Date().toISOString(),
  };

  const ddbItem = {};
  for (const [k, v] of Object.entries(item)) {
    ddbItem[k] = toAttr(v);
  }

  await dynamo.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: ddbItem,
      ConditionExpression: "attribute_not_exists(fileId)",
    })
  );

  return toFileDto(item);
}

export const handler = async (event) => {
  try {
    const { method, path } = parseRoute(event);

    if (method === "OPTIONS") {
      return response(200, { ok: true });
    }

    if (method === "GET" && path.endsWith("/dashboard")) {
      const files = await listFiles();
      const totalFiles = files.length;
      const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
      return response(200, {
        totalFiles,
        storageUsed: Number((totalBytes / (1024 * 1024)).toFixed(2)),
        lastUpload: files[0]?.uploadedAt || "",
      });
    }

    if (method === "GET" && path.endsWith("/files")) {
      const files = await listFiles();
      return response(200, { items: files });
    }

    if (method === "POST" && path.endsWith("/files")) {
      const parsedBody =
        typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
      const created = await createFile(parsedBody);
      return response(201, created);
    }

    const fileIdMatch = path.match(/\/files\/([^/]+)$/);
    if (fileIdMatch && method === "GET") {
      const file = await getFileById(decodeURIComponent(fileIdMatch[1]));
      if (!file) {
        return response(404, { message: "File not found" });
      }
      return response(200, file);
    }

    if (fileIdMatch && method === "DELETE") {
      const fileId = decodeURIComponent(fileIdMatch[1]);
      await removeFile(fileId);
      return response(200, { success: true, fileId });
    }

    return response(404, { message: "Route not found" });
  } catch (error) {
    console.error("Lambda error:", error);
    return response(500, {
      message: "Internal Server Error",
      error: error?.message || "Unknown error",
    });
  }
};
