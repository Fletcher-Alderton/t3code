import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { Button } from "../ui/button";

// Share a single preview slot across all mounted chat timelines in this renderer.
let activePreview: string | null = null;
const subscribers = new Set<() => void>();
const subscribe = (notify: () => void) => {
  subscribers.add(notify);
  return () => {
    subscribers.delete(notify);
  };
};
const readPreview = () => activePreview;
const readServerPreview = () => false;
function selectPreview(id: string | null) {
  if (activePreview === id) return;
  activePreview = id;
  subscribers.forEach((notify) => notify());
}

export function astroPreviewUrl(source: string): string | null {
  const value = source.trim();
  if (value.length > 2048 || !/^https?:\/\//i.test(value) || /[\s\\]/u.test(value)) return null;
  const url = URL.parse(value);
  if (!url || url.username || url.password) return null;
  if (url.protocol === "https:") return url.href;
  if (url.port && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return url.href;
  return null;
}

export function AstroPreviewCard({ url }: { url: string }) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const opened = useSyncExternalStore(subscribe, () => readPreview() === id, readServerPreview);

  useEffect(() => {
    if (!opened || !box.current) return;
    const close = () => {
      if (readPreview() === id) selectPreview(null);
    };
    const onVisibilityChange = () => {
      if (document.hidden) close();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) close();
    });
    observer.observe(box.current);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [id, opened]);

  return (
    <div ref={box} className="my-2 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex min-w-0 flex-wrap items-center gap-2 p-2">
        <span className="text-sm font-semibold">Astro preview</span>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={url}>
          {new URL(url).host}
        </span>
        <Button
          size="xs"
          variant="outline"
          aria-expanded={opened}
          onClick={() => selectPreview(opened ? null : id)}
        >
          {opened ? "Unload preview" : "Load static preview"}
        </Button>
        <a className="text-xs underline" href={url} target="_blank" rel="noopener noreferrer">
          Open site
        </a>
      </div>
      {opened && (
        <iframe
          className="block h-[min(420px,60vh)] w-full border-t border-border bg-white"
          src={url}
          title={`Static Astro preview: ${new URL(url).host}`}
          sandbox=""
          referrerPolicy="no-referrer"
          allow="autoplay 'none'; camera 'none'; microphone 'none'; geolocation 'none'"
        />
      )}
    </div>
  );
}
