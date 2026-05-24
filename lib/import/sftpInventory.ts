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

export function getSftpEnvDebug(): SftpEnvDebug {
  const password = process.env.SFTP_PASSWORD?.trim() ?? "";
  const port = Number(process.env.SFTP_PORT || 22);
  return {
    sftpHost: process.env.SFTP_HOST?.trim() ?? "",
    sftpPort: Number.isFinite(port) ? port : 22,
    sftpUser: process.env.SFTP_USER?.trim() ?? "",
    hasPassword: password.length > 0,
    passwordLength: password.length,
    sftpPath: process.env.SFTP_PATH?.trim() || "/",
  };
}

export function readSftpConfigFromEnv(): SftpConfig {
  const host = process.env.SFTP_HOST?.trim();
  const username = process.env.SFTP_USER?.trim();
  const password = process.env.SFTP_PASSWORD?.trim();
  const remotePath = process.env.SFTP_PATH?.trim() || "/";
  const port = Number(process.env.SFTP_PORT || 22);

  if (!host || !username || !password) {
    throw new Error(
      "Missing SFTP_HOST, SFTP_USER, or SFTP_PASSWORD environment variables",
    );
  }
  if (!Number.isFinite(port)) {
    throw new Error("SFTP_PORT must be a valid number");
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

function isInventoryFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".csv") || lower.endsWith(".txt");
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
  const client = new SftpClient();

  try {
    const password = process.env.SFTP_PASSWORD!.trim();
    const username = process.env.SFTP_USER!.trim();

    await client.connect({
      host: process.env.SFTP_HOST!.trim(),
      port: Number(process.env.SFTP_PORT || 22),
      username,
      password,
      authHandler: createSftpAuthHandler(username, password),
    });

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
  const client = new SftpClient();

  try {
    const password = process.env.SFTP_PASSWORD!.trim();
    const username = process.env.SFTP_USER!.trim();

    await client.connect({
      host: process.env.SFTP_HOST!.trim(),
      port: Number(process.env.SFTP_PORT || 22),
      username,
      password,
      authHandler: createSftpAuthHandler(username, password),
    });

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
