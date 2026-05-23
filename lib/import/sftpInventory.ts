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

/** List .txt files in SFTP_PATH and download the newest by modifyTime. */
export async function downloadNewestTxtFile(
  config: SftpConfig,
): Promise<DownloadedInventoryFile> {
  const client = new SftpClient();

  try {
    const password = process.env.SFTP_PASSWORD!.trim();

    await client.connect({
      host: process.env.SFTP_HOST!.trim(),
      port: Number(process.env.SFTP_PORT || 22),
      username: process.env.SFTP_USER!.trim(),
      password,
      tryKeyboard: true,
      onKeyboardInteractive: (
        _name,
        _instructions,
        _lang,
        prompts,
        finish,
      ) => {
        finish(prompts.map(() => password));
      },
    });

    const listing = await client.list(config.remotePath);
    const txtFiles = listing.filter(
      (entry) =>
        entry.type === "-" && entry.name.toLowerCase().endsWith(".txt"),
    );

    if (txtFiles.length === 0) {
      throw new Error(
        `No .txt files found in SFTP path: ${config.remotePath}`,
      );
    }

    txtFiles.sort((a, b) => {
      const aTime = a.modifyTime ?? 0;
      const bTime = b.modifyTime ?? 0;
      return bTime - aTime;
    });

    const newest = txtFiles[0];
    const remoteFilePath = joinRemotePath(config.remotePath, newest.name);
    const buffer = await client.get(remoteFilePath);
    const content = Buffer.isBuffer(buffer)
      ? buffer.toString("utf8")
      : String(buffer);

    return {
      fileName: newest.name,
      remotePath: remoteFilePath,
      modifiedAt: newest.modifyTime ?? null,
      content,
    };
  } finally {
    await client.end().catch(() => undefined);
  }
}
