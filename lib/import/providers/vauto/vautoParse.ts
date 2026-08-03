import { parseDealerSendFile } from "@/lib/import/dealerSendParse";

export interface VautoParsedFeed {
  delimiter: string;
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse vAuto export content. Supports CSV/TXT with pipe, tab, or comma
 * delimiters (reuses shared delimiter detection). XML/JSON are rejected.
 */
export function parseVautoFeedFile(content: string): VautoParsedFeed {
  const lower = content.trimStart().slice(0, 200).toLowerCase();
  if (lower.startsWith("<?xml") || lower.startsWith("<")) {
    throw new Error(
      "vAuto XML export detected — XML parser not configured. Export CSV or TXT.",
    );
  }
  if (lower.startsWith("{") || lower.startsWith("[")) {
    throw new Error(
      "vAuto JSON export detected — JSON parser not configured. Export CSV or TXT.",
    );
  }

  const parsed = parseDealerSendFile(content);
  return {
    delimiter: parsed.delimiter,
    headers: parsed.headers,
    rows: parsed.rows,
  };
}

export function inspectVautoFeedContent(content: string): {
  headerPreview: string[];
  rowCountEstimate: number | null;
  detectedFormat: string;
} {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headerPreview = lines.slice(0, 3);
  const trimmed = content.trimStart().toLowerCase();
  let detectedFormat = "txt";
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
    detectedFormat = "xml";
  } else if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    detectedFormat = "json";
  } else if (lines[0]?.includes(",")) {
    detectedFormat = "csv";
  }
  const rowCountEstimate =
    detectedFormat === "csv" || detectedFormat === "txt"
      ? Math.max(0, lines.length - 1)
      : null;
  return { headerPreview, rowCountEstimate, detectedFormat };
}

/** True when the filename looks like a vAuto CSV/TXT inventory export. */
export function isVautoInventoryFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith(".csv") || lower.endsWith(".txt");
}
