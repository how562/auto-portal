import { detectDelimiter } from "@/lib/import/dealerSendParse";
import type { DealerSendDelimiter } from "@/lib/import/dealerSendParse";

export interface VautoParsedFeed {
  delimiter: string;
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * RFC 4180-style CSV document parser.
 * Required for vAuto feeds: Description / Features / Photo Url List are quoted
 * and contain commas (and occasionally newlines).
 */
export function parseCsvDocument(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      row.push(current.trim());
      current = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current.trim());
      current = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }

  return rows;
}

function parseDelimitedLine(
  line: string,
  delimiter: Exclude<DealerSendDelimiter, ",">,
): string[] {
  return line.split(delimiter).map((cell) => cell.trim());
}

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, "");
}

function rowToRecord(
  headers: string[],
  values: string[],
): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    const key = normalizeHeader(header);
    if (!key) return;
    record[key] = values[index]?.trim() ?? "";
  });
  return record;
}

/**
 * Parse vAuto export content. Supports CSV/TXT (comma, pipe, tab).
 * Comma CSV uses document-level parsing so quoted fields stay intact.
 */
export function parseVautoFeedFile(content: string): VautoParsedFeed {
  const trimmed = content.replace(/^\uFEFF/, "");
  const lower = trimmed.trimStart().slice(0, 200).toLowerCase();
  if (lower.startsWith("<?xml") || lower.startsWith("<")) {
    throw new Error(
      "vAuto XML export detected — XML parser not configured. Use CSV/TXT exports.",
    );
  }
  if (lower.startsWith("{") || lower.startsWith("[")) {
    throw new Error(
      "vAuto JSON export detected — JSON parser not configured. Use CSV/TXT exports.",
    );
  }

  const firstNonEmpty =
    trimmed.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
  if (!firstNonEmpty) {
    throw new Error("vAuto file is empty");
  }

  const delimiter = detectDelimiter(firstNonEmpty);
  let matrix: string[][];

  if (delimiter === ",") {
    matrix = parseCsvDocument(trimmed);
  } else {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
    matrix = lines.map((line) =>
      parseDelimitedLine(line, delimiter as Exclude<DealerSendDelimiter, ",">),
    );
  }

  if (matrix.length < 2) {
    throw new Error("vAuto file must include a header row and at least one data row");
  }

  const headers = matrix[0].map(normalizeHeader);
  if (headers.every((h) => !h)) {
    throw new Error("vAuto file header row is empty");
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < matrix.length; i += 1) {
    const record = rowToRecord(headers, matrix[i] ?? []);
    if (Object.values(record).some((v) => v.length > 0)) {
      rows.push(record);
    }
  }

  return { delimiter, headers, rows };
}

export function inspectVautoFeedContent(content: string): {
  headerPreview: string[];
  columnHeaders: string[];
  rowCountEstimate: number | null;
  detectedFormat: string;
} {
  const trimmed = content.replace(/^\uFEFF/, "");
  const lower = trimmed.trimStart().toLowerCase();
  let detectedFormat = "txt";
  if (lower.startsWith("<?xml") || lower.startsWith("<")) {
    detectedFormat = "xml";
  } else if (lower.startsWith("{") || lower.startsWith("[")) {
    detectedFormat = "json";
  } else {
    const firstLine =
      trimmed.split(/\r?\n/).find((line) => line.trim().length > 0) ?? "";
    if (firstLine.includes(",")) detectedFormat = "csv";
    else if (firstLine.includes("|")) detectedFormat = "txt";
    else if (firstLine.includes("\t")) detectedFormat = "txt";
  }

  if (detectedFormat === "xml" || detectedFormat === "json") {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
    return {
      headerPreview: lines.slice(0, 3),
      columnHeaders: [],
      rowCountEstimate: null,
      detectedFormat,
    };
  }

  try {
    const parsed = parseVautoFeedFile(trimmed);
    return {
      headerPreview: parsed.headers.slice(0, 40),
      columnHeaders: parsed.headers,
      rowCountEstimate: parsed.rows.length,
      detectedFormat: parsed.delimiter === "," ? "csv" : "txt",
    };
  } catch {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
    return {
      headerPreview: lines.slice(0, 3),
      columnHeaders: [],
      rowCountEstimate: Math.max(0, lines.length - 1),
      detectedFormat,
    };
  }
}
