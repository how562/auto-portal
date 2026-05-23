export type DealerSendDelimiter = "|" | "\t" | ",";

export interface ParsedDealerSendFile {
  delimiter: DealerSendDelimiter;
  headers: string[];
  rows: Record<string, string>[];
}

function countDelimiter(line: string, delimiter: string): number {
  return line.split(delimiter).length - 1;
}

/** Pick pipe, tab, or comma based on the header line. */
export function detectDelimiter(headerLine: string): DealerSendDelimiter {
  const pipe = countDelimiter(headerLine, "|");
  const tab = countDelimiter(headerLine, "\t");
  const comma = countDelimiter(headerLine, ",");

  if (pipe >= tab && pipe >= comma && pipe > 0) return "|";
  if (tab >= comma && tab > 0) return "\t";
  return ",";
}

function parseDelimitedLine(
  line: string,
  delimiter: DealerSendDelimiter,
): string[] {
  if (delimiter === ",") {
    return parseCsvLine(line);
  }
  return line.split(delimiter).map((cell) => cell.trim());
}

/** Minimal CSV parser (quoted fields, escaped quotes). */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
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

/** Parse DealerSend .txt content into header-keyed row objects. */
export function parseDealerSendFile(content: string): ParsedDealerSendFile {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error("DealerSend file is empty");
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseDelimitedLine(lines[0], delimiter).map(normalizeHeader);

  if (headers.length === 0) {
    throw new Error("DealerSend file has no headers");
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseDelimitedLine(lines[i], delimiter);
    const record = rowToRecord(headers, values);
    const hasData = Object.values(record).some((v) => v.length > 0);
    if (hasData) {
      rows.push(record);
    }
  }

  return { delimiter, headers, rows };
}
