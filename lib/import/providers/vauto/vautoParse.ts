import { parseDealerSendFile } from "@/lib/import/dealerSendParse";

export interface VautoParsedFeed {
  delimiter: string;
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse vAuto export content. Initial implementation supports CSV/TXT
 * (same delimiter detection as HomeNet). XML/JSON branches added when
 * the first vAuto sample file arrives.
 */
export function parseVautoFeedFile(content: string): VautoParsedFeed {
  const lower = content.trimStart().slice(0, 200).toLowerCase();
  if (lower.startsWith("<?xml") || lower.startsWith("<")) {
    throw new Error(
      "vAuto XML export detected — XML parser not configured yet. Archive the file and map columns after format review.",
    );
  }
  if (lower.startsWith("{") || lower.startsWith("[")) {
    throw new Error(
      "vAuto JSON export detected — JSON parser not configured yet.",
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
