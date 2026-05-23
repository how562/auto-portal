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

export function readSftpConfigFromEnv(): SftpConfig {
  const host = process.env.SFTP_HOST?.trim();
  const username = process.env.SFTP_USER?.trim();
  const password = process.env.SFTP_PASSWORD?.trim();
  const remotePath = process.env.SFTP_PATH?.trim() || "/";
  const portRaw = process.env.SFTP_PORT?.trim() || "22";
  const port = Number.parseInt(portRaw, 10);

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
    await client.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      readyTimeout: 20000,
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
