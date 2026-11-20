import { memo } from "react";

const MAX_ROWS = 24;
const MAX_SOURCE_LENGTH = 4096;
const NUMBER = /^[+]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i;

export function parseMarkdownBarChart(source: string) {
  if (source.length > MAX_SOURCE_LENGTH) return null;
  const [title, ...lines] = source.trim().split(/\r?\n/);
  if (!title?.trim() || title.length > 120 || lines.length < 1 || lines.length > MAX_ROWS) {
    return null;
  }
  const rows: { label: string; value: number; display: string }[] = [];
  const labels = new Set<string>();
  let max = 0;
  for (const line of lines) {
    const separator = line.indexOf("|");
    if (separator < 0) return null;
    const label = line.slice(0, separator).trim();
    const display = line.slice(separator + 1).trim();
    if (!label || label.length > 80 || labels.has(label) || !NUMBER.test(display)) return null;
    const value = Number(display);
    if (!Number.isFinite(value)) return null;
    max = Math.max(value, max);
    labels.add(label);
    rows.push({ label, value, display });
  }
  return { title: title.trim(), rows, max };
}

export const MarkdownBarChart = memo(function MarkdownBarChart({ source }: { source: string }) {
  const chart = parseMarkdownBarChart(source);
  if (!chart)
    return (
      <pre>
        <code>{source}</code>
      </pre>
    );

  return (
    <figure className="my-3 rounded-lg border border-border bg-card p-3" data-chat-bar-chart="">
      <figcaption className="mb-3 text-sm font-semibold text-foreground">{chart.title}</figcaption>
      <dl className="grid gap-2.5">
        {chart.rows.map(({ label, value, display }) => (
          <div key={label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1">
            <dt className="text-xs text-foreground">{label}</dt>
            <dd className="text-end text-xs tabular-nums text-foreground">{display}</dd>
            <dd aria-hidden="true" className="col-span-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-info"
                style={{ width: `${chart.max === 0 ? 0 : (value / chart.max) * 100}%` }}
              />
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
});
