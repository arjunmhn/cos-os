"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Card } from "./card";
import { Button } from "./button";
import { Check, Copy, Download, Eye, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

/* -------------------- Public API -------------------- */

export function MarkdownContent({
  body,
  className,
  density = "regular",
}: {
  body: string;
  className?: string;
  density?: "regular" | "compact";
}) {
  const blocks = useMemo(() => parse(body), [body]);
  return (
    <div
      className={cn(
        "max-w-none break-words",
        density === "compact" ? "text-[13.5px]" : "text-[14px]",
        className
      )}
    >
      {blocks.map((b, i) => renderBlock(b, i, density))}
    </div>
  );
}

export function MarkdownDocument({
  body,
  title,
  eyebrow,
  filename,
  className,
}: {
  body: string;
  title?: string;
  eyebrow?: string;
  filename?: string;
  className?: string;
}) {
  const [view, setView] = useState<"pretty" | "source">("pretty");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const download = () => {
    const blob = new Blob([body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "document.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("p-0 overflow-hidden flex flex-col min-w-0", className)}>
      <div className="px-4 sm:px-5 py-3 border-b divider flex items-center justify-between gap-3 bg-zinc-50/40">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10.5px] uppercase tracking-[0.12em] font-semibold text-zinc-500">
              {eyebrow}
            </div>
          )}
          {title && (
            <h3 className="mt-0.5 text-[14px] font-semibold tracking-tight text-zinc-900 truncate">
              {title}
            </h3>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="inline-flex items-center rounded-lg border divider bg-white p-0.5">
            <button
              onClick={() => setView("pretty")}
              className={cn(
                "px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors inline-flex items-center gap-1",
                view === "pretty" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              )}
              aria-label="Pretty view"
            >
              <Eye className="h-3 w-3" /> Pretty
            </button>
            <button
              onClick={() => setView("source")}
              className={cn(
                "px-2.5 h-7 text-[11px] font-medium rounded-md transition-colors inline-flex items-center gap-1",
                view === "source" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-900"
              )}
              aria-label="Source view"
            >
              <FileCode2 className="h-3 w-3" /> Source
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={download}>
            <Download className="h-3 w-3" /> .md
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto scroll-dim">
        {view === "pretty" ? (
          <div className="px-6 sm:px-8 py-7 sm:py-9 max-w-3xl mx-auto">
            <MarkdownContent body={body} />
          </div>
        ) : (
          <pre className="p-5 text-[12px] leading-relaxed text-zinc-800 font-mono whitespace-pre-wrap break-words">
            {body}
          </pre>
        )}
      </div>
    </Card>
  );
}

/* -------------------- Parser -------------------- */

type Align = "left" | "right" | "center";

type Block =
  | { type: "h"; level: number; inline: string }
  | { type: "p"; inline: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang?: string; lines: string[] }
  | { type: "kpi"; raw: string }
  | { type: "chart"; raw: string }
  | { type: "blockquote"; inline: string }
  | { type: "table"; headers: string[]; align: Align[]; rows: string[][] }
  | { type: "hr" };

function parse(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let inCode = false;
  let codeLang: string | undefined;
  let codeBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listBuf: string[] = [];
  let paraBuf: string[] = [];
  let quoteBuf: string[] = [];

  const flushPara = () => {
    if (paraBuf.length > 0) {
      blocks.push({ type: "p", inline: paraBuf.join(" ") });
      paraBuf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length > 0 && listType) {
      blocks.push({ type: listType, items: listBuf });
      listBuf = [];
      listType = null;
    }
  };
  const flushQuote = () => {
    if (quoteBuf.length > 0) {
      blocks.push({ type: "blockquote", inline: quoteBuf.join(" ") });
      quoteBuf = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    const fence = ln.match(/^```(\w*)/);
    if (fence) {
      flushAll();
      if (inCode) {
        const lang = (codeLang || "").toLowerCase();
        if (lang === "kpi") {
          blocks.push({ type: "kpi", raw: codeBuf.join("\n") });
        } else if (lang === "chart") {
          blocks.push({ type: "chart", raw: codeBuf.join("\n") });
        } else {
          blocks.push({ type: "code", lang: codeLang, lines: codeBuf });
        }
        codeBuf = [];
        codeLang = undefined;
        inCode = false;
      } else {
        inCode = true;
        codeLang = fence[1] || undefined;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(ln);
      continue;
    }
    if (/^(---+|\*\*\*+|___+)\s*$/.test(ln)) {
      flushAll();
      blocks.push({ type: "hr" });
      continue;
    }
    const head = ln.match(/^(#{1,6})\s+(.+)/);
    if (head) {
      flushAll();
      blocks.push({ type: "h", level: head[1].length, inline: head[2].trim() });
      continue;
    }

    // Tables: header row + separator row + body rows
    if (/^\s*\|.*\|\s*$/.test(ln) && lines[i + 1] && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
      flushAll();
      const headers = splitRow(ln);
      const align: Align[] = splitRow(lines[i + 1]).map((cell) => {
        const trimmed = cell.trim();
        const left = trimmed.startsWith(":");
        const right = trimmed.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        return "left";
      });
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
        rows.push(splitRow(lines[j]));
        j++;
      }
      // Pad / trim rows to header length
      const w = headers.length;
      const padded = rows.map((r) => {
        const out = r.slice(0, w);
        while (out.length < w) out.push("");
        return out;
      });
      const alignPadded = align.slice(0, w);
      while (alignPadded.length < w) alignPadded.push("left");
      blocks.push({ type: "table", headers, align: alignPadded, rows: padded });
      i = j - 1;
      continue;
    }

    const quote = ln.match(/^>\s?(.*)/);
    if (quote) {
      flushPara();
      flushList();
      quoteBuf.push(quote[1]);
      continue;
    }
    const ul = ln.match(/^\s*[-*+]\s+(.+)/);
    if (ul) {
      flushPara();
      flushQuote();
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(ul[1]);
      continue;
    }
    const ol = ln.match(/^\s*\d+\.\s+(.+)/);
    if (ol) {
      flushPara();
      flushQuote();
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(ol[1]);
      continue;
    }
    if (ln.trim() === "") {
      flushAll();
      continue;
    }
    flushList();
    flushQuote();
    paraBuf.push(ln);
  }
  flushAll();
  if (inCode && codeBuf.length > 0) {
    blocks.push({ type: "code", lang: codeLang, lines: codeBuf });
  }
  return blocks;
}

function splitRow(line: string): string[] {
  // Strip leading/trailing pipes, then split on |
  const inner = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return inner.split("|").map((s) => s.trim());
}

/* -------------------- Renderer -------------------- */

function renderBlock(b: Block, key: number, density: "regular" | "compact"): ReactNode {
  const compact = density === "compact";
  if (b.type === "code") {
    return (
      <pre
        key={key}
        className={cn(
          "rounded-lg bg-zinc-900 text-zinc-100 font-mono overflow-x-auto scroll-dim",
          compact ? "my-3 px-3.5 py-2.5 text-[11.5px]" : "my-4 px-4 py-3.5 text-[12.5px]"
        )}
      >
        {b.lines.join("\n")}
      </pre>
    );
  }
  if (b.type === "kpi") {
    return <KpiTilesBlock key={key} raw={b.raw} compact={compact} />;
  }
  if (b.type === "chart") {
    return <ChartBlock key={key} raw={b.raw} compact={compact} />;
  }
  if (b.type === "table") {
    return <TableBlock key={key} block={b} compact={compact} />;
  }
  if (b.type === "hr") {
    return <hr key={key} className={cn("border-t border-zinc-200", compact ? "my-4" : "my-7")} />;
  }
  if (b.type === "h") {
    if (b.level === 1) {
      return (
        <h1
          key={key}
          className={cn(
            "font-semibold tracking-tight text-zinc-900 leading-tight first:mt-0",
            compact ? "text-[18px] mt-5 mb-3" : "text-[24px] mt-8 mb-4"
          )}
        >
          {renderInline(b.inline)}
        </h1>
      );
    }
    if (b.level === 2) {
      return (
        <h2
          key={key}
          className={cn(
            "font-semibold tracking-tight text-zinc-900 first:mt-0 border-b divider",
            compact ? "text-[15px] mt-5 mb-2 pb-1.5" : "text-[18px] mt-7 mb-3 pb-2"
          )}
        >
          {renderInline(b.inline)}
        </h2>
      );
    }
    if (b.level === 3) {
      return (
        <h3
          key={key}
          className={cn(
            "font-semibold tracking-tight text-zinc-900 first:mt-0",
            compact ? "text-[13.5px] mt-4 mb-1.5" : "text-[15px] mt-5 mb-2"
          )}
        >
          {renderInline(b.inline)}
        </h3>
      );
    }
    return (
      <h4
        key={key}
        className={cn(
          "font-semibold uppercase tracking-[0.14em] text-zinc-500 first:mt-0",
          compact ? "text-[10px] mt-3 mb-1.5" : "text-[10.5px] mt-5 mb-2"
        )}
      >
        {renderInline(b.inline)}
      </h4>
    );
  }
  if (b.type === "blockquote") {
    return (
      <blockquote
        key={key}
        className={cn(
          "border-l-2 border-indigo-300 pl-4 text-zinc-600 italic leading-relaxed break-words",
          compact ? "my-3 text-[13px]" : "my-4 text-[14px]"
        )}
      >
        {renderInline(b.inline)}
      </blockquote>
    );
  }
  if (b.type === "ul") {
    return (
      <ul
        key={key}
        className={cn(
          "space-y-1.5 pl-5 list-disc marker:text-zinc-400",
          compact ? "my-2.5" : "my-3"
        )}
      >
        {b.items.map((it, i) => (
          <li
            key={i}
            className={cn(
              "leading-relaxed text-zinc-800 break-words",
              compact ? "text-[13.5px]" : "text-[14px]"
            )}
          >
            {renderInline(it)}
          </li>
        ))}
      </ul>
    );
  }
  if (b.type === "ol") {
    return (
      <ol
        key={key}
        className={cn(
          "space-y-1.5 pl-5 list-decimal marker:text-zinc-400 marker:font-medium",
          compact ? "my-2.5" : "my-3"
        )}
      >
        {b.items.map((it, i) => (
          <li
            key={i}
            className={cn(
              "leading-relaxed text-zinc-800 break-words pl-1",
              compact ? "text-[13.5px]" : "text-[14px]"
            )}
          >
            {renderInline(it)}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <p
      key={key}
      className={cn(
        "leading-relaxed text-zinc-800 break-words",
        compact ? "my-2 text-[13.5px]" : "my-3 text-[14px]"
      )}
    >
      {renderInline(b.inline)}
    </p>
  );
}

/* -------------------- Tables -------------------- */

function TableBlock({
  block,
  compact,
}: {
  block: Extract<Block, { type: "table" }>;
  compact: boolean;
}) {
  return (
    <div className={cn("overflow-x-auto scroll-dim", compact ? "my-3" : "my-4")}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-zinc-50/80 border-b divider">
            {block.headers.map((h, i) => (
              <th
                key={i}
                className={cn(
                  "px-3 py-2 text-[11px] uppercase tracking-[0.1em] font-semibold text-zinc-600 align-bottom",
                  block.align[i] === "right" && "text-right",
                  block.align[i] === "center" && "text-center"
                )}
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri} className="border-b divider last:border-b-0 hover:bg-zinc-50/40">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    "px-3 py-2 align-top",
                    compact ? "text-[12.5px]" : "text-[13px]",
                    "text-zinc-800",
                    block.align[ci] === "right" && "text-right",
                    block.align[ci] === "center" && "text-center"
                  )}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- KPI tiles -------------------- */

type KpiTone = "positive" | "negative" | "warning" | "neutral";

type KpiTile = {
  label: string;
  value: string;
  delta?: string;
  tone?: KpiTone;
  hint?: string;
};

const TONE_BG: Record<KpiTone, string> = {
  positive: "bg-emerald-50/60 border-emerald-200/70",
  negative: "bg-rose-50/60 border-rose-200/70",
  warning: "bg-amber-50/60 border-amber-200/70",
  neutral: "bg-zinc-50/60 border-zinc-200",
};
const TONE_TEXT: Record<KpiTone, string> = {
  positive: "text-emerald-700",
  negative: "text-rose-700",
  warning: "text-amber-700",
  neutral: "text-zinc-600",
};

function KpiTilesBlock({ raw, compact }: { raw: string; compact: boolean }) {
  let parsed: { tiles?: KpiTile[] } | null = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return <FallbackBlock label="kpi" raw={raw} compact={compact} />;
  }
  const tiles = parsed?.tiles;
  if (!Array.isArray(tiles) || tiles.length === 0) {
    return <FallbackBlock label="kpi" raw={raw} compact={compact} />;
  }
  return (
    <div
      className={cn(
        "grid gap-2.5",
        compact ? "my-3" : "my-4",
        tiles.length === 1 && "grid-cols-1",
        tiles.length === 2 && "grid-cols-1 sm:grid-cols-2",
        tiles.length === 3 && "grid-cols-1 sm:grid-cols-3",
        tiles.length >= 4 && "grid-cols-2 sm:grid-cols-4"
      )}
    >
      {tiles.map((t, i) => {
        const tone: KpiTone = t.tone ?? "neutral";
        return (
          <div
            key={i}
            className={cn("rounded-lg border px-3.5 py-3 min-w-0", TONE_BG[tone])}
          >
            <div className="text-[10px] uppercase tracking-[0.1em] font-semibold text-zinc-500 truncate">
              {t.label}
            </div>
            <div className="mt-1 text-[20px] font-semibold tracking-tight text-zinc-900 break-words leading-tight">
              {t.value}
            </div>
            {t.delta && (
              <div className={cn("mt-0.5 text-[11px] font-medium", TONE_TEXT[tone])}>
                {t.delta}
              </div>
            )}
            {t.hint && (
              <div className="mt-1 text-[10.5px] text-zinc-500 leading-relaxed break-words">
                {t.hint}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- Charts -------------------- */

type ChartType = "line" | "bar" | "area";
type ChartSeries = { key: string; label?: string };
type ChartSpec = {
  type: ChartType;
  title?: string;
  description?: string;
  xKey: string;
  yKey?: string;
  yLabel?: string;
  series?: ChartSeries[];
  data: Array<Record<string, number | string>>;
};

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#06b6d4", "#d946ef", "#ef4444"];

function ChartBlock({ raw, compact }: { raw: string; compact: boolean }) {
  let spec: ChartSpec | null = null;
  try {
    spec = JSON.parse(raw);
  } catch {
    return <FallbackBlock label="chart" raw={raw} compact={compact} />;
  }
  if (!spec || !Array.isArray(spec.data) || spec.data.length === 0 || !spec.xKey) {
    return <FallbackBlock label="chart" raw={raw} compact={compact} />;
  }
  if (!["line", "bar", "area"].includes(spec.type)) spec.type = "line";

  const series: ChartSeries[] =
    spec.series && spec.series.length > 0
      ? spec.series
      : spec.yKey
        ? [{ key: spec.yKey, label: spec.yLabel || spec.yKey }]
        : Object.keys(spec.data[0]).filter((k) => k !== spec.xKey).map((k) => ({ key: k }));

  return (
    <div
      className={cn(
        "rounded-lg border divider bg-white",
        compact ? "my-3 px-3 py-3" : "my-4 px-4 py-4"
      )}
    >
      {(spec.title || spec.description) && (
        <div className="mb-3">
          {spec.title && (
            <div className="text-[13px] font-semibold tracking-tight text-zinc-900">
              {spec.title}
            </div>
          )}
          {spec.description && (
            <div className="mt-0.5 text-[11.5px] text-zinc-500 leading-relaxed">
              {spec.description}
            </div>
          )}
        </div>
      )}
      <div className={cn("w-full", compact ? "h-[180px]" : "h-[220px]")}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChartInner(spec, series)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function renderChartInner(spec: ChartSpec, series: ChartSeries[]) {
  const tickStyle = { fontSize: 11, fill: "#71717a" };
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />;
  const xAxis = <XAxis dataKey={spec.xKey} tick={tickStyle} stroke="#e4e4e7" />;
  const yAxis = <YAxis tick={tickStyle} stroke="#e4e4e7" />;
  const tooltip = <Tooltip content={<ChartTooltip />} />;
  const legend =
    series.length > 1 ? <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} /> : null;

  if (spec.type === "bar") {
    return (
      <BarChart data={spec.data}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label || s.key}
            fill={CHART_COLORS[i % CHART_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    );
  }
  if (spec.type === "area") {
    return (
      <AreaChart data={spec.data}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`fill-${s.key}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {legend}
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label || s.key}
            stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fill={`url(#fill-${s.key}-${i})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    );
  }
  return (
    <LineChart data={spec.data}>
      {grid}
      {xAxis}
      {yAxis}
      {tooltip}
      {legend}
      {series.map((s, i) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.label || s.key}
          stroke={CHART_COLORS[i % CHART_COLORS.length]}
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      ))}
    </LineChart>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border divider bg-white shadow-elevated px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-[0.1em] text-zinc-500">{label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.color }} />
            <span className="text-zinc-700">{p.name}:</span>
            <span className="font-semibold text-zinc-900">
              {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FallbackBlock({ label, raw, compact }: { label: string; raw: string; compact: boolean }) {
  return (
    <pre
      className={cn(
        "rounded-lg bg-zinc-900 text-zinc-100 font-mono overflow-x-auto scroll-dim",
        compact ? "my-3 px-3.5 py-2.5 text-[11.5px]" : "my-4 px-4 py-3.5 text-[12.5px]"
      )}
    >
      <span className="text-zinc-400">{`// invalid ${label} block — falling back to raw`}</span>
      {"\n"}
      {raw}
    </pre>
  );
}

/* -------------------- Inline tokenizer -------------------- */

function renderInline(s: string): ReactNode {
  type Token =
    | { kind: "text"; text: string }
    | { kind: "code"; text: string }
    | { kind: "bold"; text: string }
    | { kind: "italic"; text: string }
    | { kind: "link"; text: string; url: string };

  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "`") {
      const end = s.indexOf("`", i + 1);
      if (end > i) {
        tokens.push({ kind: "code", text: s.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "*" && s[i + 1] === "*") {
      const end = s.indexOf("**", i + 2);
      if (end > i + 1) {
        tokens.push({ kind: "bold", text: s.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (ch === "_" && s[i - 1] !== "_" && /\S/.test(s[i + 1] || "")) {
      const end = s.indexOf("_", i + 1);
      if (end > i && /\S/.test(s[end - 1])) {
        tokens.push({ kind: "italic", text: s.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "*" && s[i + 1] !== "*" && /\S/.test(s[i + 1] || "")) {
      const end = s.indexOf("*", i + 1);
      if (end > i && s[end + 1] !== "*" && /\S/.test(s[end - 1])) {
        tokens.push({ kind: "italic", text: s.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (ch === "[") {
      const closeBracket = s.indexOf("]", i + 1);
      if (closeBracket > i && s[closeBracket + 1] === "(") {
        const closeParen = s.indexOf(")", closeBracket + 2);
        if (closeParen > closeBracket) {
          tokens.push({
            kind: "link",
            text: s.slice(i + 1, closeBracket),
            url: s.slice(closeBracket + 2, closeParen),
          });
          i = closeParen + 1;
          continue;
        }
      }
    }
    let j = i;
    while (j < s.length && !/[`*_[]/.test(s[j])) j++;
    if (j === i) j = i + 1;
    tokens.push({ kind: "text", text: s.slice(i, j) });
    i = j;
  }

  return tokens.map((t, k) => {
    if (t.kind === "code") {
      return (
        <code
          key={k}
          className="font-mono text-[0.92em] bg-zinc-100 rounded px-1 py-0.5 break-all"
        >
          {t.text}
        </code>
      );
    }
    if (t.kind === "bold") {
      return (
        <strong key={k} className="font-semibold text-zinc-900">
          {renderInline(t.text)}
        </strong>
      );
    }
    if (t.kind === "italic") {
      return (
        <em key={k} className="italic">
          {renderInline(t.text)}
        </em>
      );
    }
    if (t.kind === "link") {
      return (
        <a
          key={k}
          href={t.url}
          target="_blank"
          rel="noreferrer"
          className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 break-all"
        >
          {t.text}
        </a>
      );
    }
    return <span key={k}>{t.text}</span>;
  });
}
