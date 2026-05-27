import type {
  AnyAuthMethod,
  AuthHandlerMiddleware,
  AuthenticationType,
  KeyboardInteractiveAuthMethod,
  PasswordAuthMethod,
} from "ssh2";
import SftpClient from "ssh2-sftp-client";

export interface SftpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  remotePath: string;
}

export interface DownloadedInventoryFile {
  fileName: string;
  remotePath: string;
  modifiedAt: number | null;
  content: string;
}

/** Safe SFTP env snapshot for failed import responses (never includes the password). */
export interface SftpEnvDebug {
  sftpHost: string;
  sftpPort: number;
  sftpUser: string;
  hasPassword: boolean;
  passwordLength: number;
  sftpPath: string;
}

export type SftpEnvPrefix = "" | "VAUTO_";

function envKey(prefix: SftpEnvPrefix, name: string): string {
  return `${prefix}${name}`;
}

export function getSftpEnvDebug(prefix: SftpEnvPrefix = ""): SftpEnvDebug {
  const password = process.env[envKey(prefix, "SFTP_PASSWORD")]?.trim() ?? "";
  const port = Number(process.env[envKey(prefix, "SFTP_PORT")] || 22);
  return {
    sftpHost: process.env[envKey(prefix, "SFTP_HOST")]?.trim() ?? "",
    sftpPort: Number.isFinite(port) ? port : 22,
    sftpUser: process.env[envKey(prefix, "SFTP_USER")]?.trim() ?? "",
    hasPassword: password.length > 0,
    passwordLength: password.length,
    sftpPath: process.env[envKey(prefix, "SFTP_PATH")]?.trim() || "/",
  };
}

/** HomeNet DealerSend SFTP (`SFTP_*` env vars). */
export function readSftpConfigFromEnv(): SftpConfig {
  return readSftpConfigFromEnvWithPrefix("");
}

/** Dedicated vAuto intake server (`VAUTO_SFTP_*` env vars). */
export function readVautoSftpConfigFromEnv(): SftpConfig {
  return readSftpConfigFromEnvWithPrefix("VAUTO_");
}

export function readSftpConfigFromEnvWithPrefix(
  prefix: SftpEnvPrefix,
): SftpConfig {
  const label = prefix === "VAUTO_" ? "VAUTO_SFTP" : "SFTP";
  const host = process.env[envKey(prefix, "SFTP_HOST")]?.trim();
  const username = process.env[envKey(prefix, "SFTP_USER")]?.trim();
  const password = process.env[envKey(prefix, "SFTP_PASSWORD")]?.trim();
  const remotePath =
    process.env[envKey(prefix, "SFTP_PATH")]?.trim() || "/";
  const port = Number(process.env[envKey(prefix, "SFTP_PORT")] || 22);

  if (!host || !username || !password) {
    throw new Error(
      `Missing ${label}_HOST, ${label}_USER, or ${label}_PASSWORD environment variables`,
    );
  }
  if (!Number.isFinite(port)) {
    throw new Error(`${label}_PORT must be a valid number`);
  }

  return { host, port, username, password, remotePath };
}

function joinRemotePath(base: string, name: string): string {
  const normalizedBase = base.replace(/\/+$/, "") || "/";
  return `${normalizedBase}/${name}`.replace(/\/+/g, "/");
}

/** Password first, then keyboard-interactive (typed via ssh2 authHandler). */
function createSftpAuthHandler(
  username: string,
  password: string,
): AuthHandlerMiddleware {
  return (methodsLeft, _partialSuccess, next) => {
    if (methodsLeft === null) {
      const attempt: PasswordAuthMethod = {
        type: "password",
        username,
        password,
      };
      next(attempt);
      return;
    }

    if (methodsLeft.includes("keyboard-interactive")) {
      const attempt: KeyboardInteractiveAuthMethod = {
        type: "keyboard-interactive",
        username,
        prompt: (_name, _instructions, _lang, prompts, finish) => {
          finish(prompts.map(() => password));
        },
      };
      next(attempt);
      return;
    }

    (next as (auth: AuthenticationType | AnyAuthMethod | false) => void)(false);
  };
}

export function isInventoryFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.endsWith(".csv") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".xml") ||
    lower.endsWith(".json")
  );
}

export function detectFeedFileFormat(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".txt")) return "txt";
  if (lower.endsWith(".xml")) return "xml";
  if (lower.endsWith(".json")) return "json";
  return "unknown";
}

async function connectSftpClient(config: SftpConfig): Promise<SftpClient> {
  const client = new SftpClient();
  await client.connect({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    authHandler: createSftpAuthHandler(config.username, config.password),
  });
  return client;
}

function selectInventoryFile<T extends { name: string; modifyTime?: number }>(
  files: T[],
): T {
  if (files.length === 1) {
    return files[0];
  }

  const csvFiles = files.filter((entry) =>
    entry.name.toLowerCase().endsWith(".csv"),
  );
  const candidates =
    csvFiles.length > 0
      ? csvFiles
      : files.filter((entry) => entry.name.toLowerCase().endsWith(".txt"));

  candidates.sort((a, b) => {
    const aTime = a.modifyTime ?? 0;
    const bTime = b.modifyTime ?? 0;
    return bTime - aTime;
  });

  return candidates[0];
}

function sortInventoryFiles<T extends { name: string; modifyTime?: number }>(
  files: T[],
): T[] {
  return [...files].sort((a, b) => {
    const byName = a.name.localeCompare(b.name, undefined, {
      sensitivity: "base",
    });
    if (byName !== 0) return byName;
    const aTime = a.modifyTime ?? 0;
    const bTime = b.modifyTime ?? 0;
    return bTime - aTime;
  });
}

async function downloadInventoryFile(
  client: SftpClient,
  remotePath: string,
  entry: { name: string; modifyTime?: number },
): Promise<DownloadedInventoryFile> {
  const remoteFilePath = joinRemotePath(remotePath, entry.name);
  const buffer = await client.get(remoteFilePath);
  const content = Buffer.isBuffer(buffer)
    ? buffer.toString("utf8")
    : String(buffer);

  return {
    fileName: entry.name,
    remotePath: remoteFilePath,
    modifiedAt: entry.modifyTime ?? null,
    content,
  };
}

/** List .txt/.csv files in SFTP_PATH and download all inventory files. */
export async function downloadAllInventoryFiles(
  config: SftpConfig,
): Promise<DownloadedInventoryFile[]> {
  const client = await connectSftpClient(config);

  try {
    const listing = await client.list(config.remotePath);
    const inventoryFiles = sortInventoryFiles(
      listing.filter(
        (entry) => entry.type === "-" && isInventoryFileName(entry.name),
      ),
    );

    if (inventoryFiles.length === 0) {
      throw new Error(
        `No .txt or .csv files found in SFTP path: ${config.remotePath}`,
      );
    }

    const downloads: DownloadedInventoryFile[] = [];
    for (const entry of inventoryFiles) {
      downloads.push(await downloadInventoryFile(client, config.remotePath, entry));
    }

    return downloads;
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** @deprecated Prefer downloadAllInventoryFiles for multi-dealer SFTP folders. */
export async function downloadNewestTxtFile(
  config: SftpConfig,
): Promise<DownloadedInventoryFile> {
  const client = await connectSftpClient(config);

  try {
    const listing = await client.list(config.remotePath);
    const inventoryFiles = listing.filter(
      (entry) => entry.type === "-" && isInventoryFileName(entry.name),
    );

    if (inventoryFiles.length === 0) {
      throw new Error(
        `No .txt or .csv files found in SFTP path: ${config.remotePath}`,
      );
    }

    const selected = selectInventoryFile(inventoryFiles);
    return downloadInventoryFile(client, config.remotePath, selected);
  } finally {
    await client.end().catch(() => undefined);
  }
}
