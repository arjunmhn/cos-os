export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const trimmed = text.trim();
  if (!trimmed) return { headers: [], rows: [] };

  const lines: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const next = trimmed[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(cell);
        cell = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && next === "\n") i++;
        current.push(cell);
        lines.push(current);
        current = [];
        cell = "";
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || current.length > 0) {
    current.push(cell);
    lines.push(current);
  }

  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].map((h) => h.trim());
  const rows: CsvRow[] = lines.slice(1).map((row) => {
    const r: CsvRow = {};
    headers.forEach((h, i) => {
      r[h] = (row[i] ?? "").trim();
    });
    return r;
  });
  return { headers, rows };
}

export function toNumber(s: string | undefined, fallback = 0): number {
  if (!s) return fallback;
  const cleaned = s.replace(/[$,%\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

export function toBool(s: string | undefined, fallback = false): boolean {
  if (!s) return fallback;
  const v = s.toLowerCase().trim();
  if (["true", "yes", "y", "1", "reversible"].includes(v)) return true;
  if (["false", "no", "n", "0", "one-way"].includes(v)) return false;
  return fallback;
}

// Try to find a header by a list of likely names (case-insensitive substring match)
export function findCol(headers: string[], candidates: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const cl = c.toLowerCase();
    const idx = lower.findIndex((h) => h === cl || h.includes(cl));
    if (idx >= 0) return headers[idx];
  }
  return null;
}
