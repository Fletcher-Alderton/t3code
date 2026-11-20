import type { Element, Root } from "hast";

// Use a finite vocabulary rather than accepting CSS from a model or transcript.
const NOTE_STYLE_CLASSES = new Map([
  ["accent", "text-info"],
  ["muted", "text-muted-foreground"],
  ["warning", "text-warning"],
  ["small", "text-xs"],
  ["large", "text-lg"],
  ["medium", "font-medium"],
  ["strong", "font-bold"],
  ["mono", "font-mono"],
  ["serif", "font-serif"],
  ["highlight", "bg-warning-surface"],
  ["chip", "bg-muted"],
  ["underline", "underline"],
  ["strike", "line-through"],
]);

function styledSpan(code: Element): Element | undefined {
  if (code.children.length !== 1) return;
  const text = code.children[0];
  if (text?.type !== "text" || !text.value.startsWith("t3:")) return;
  const separator = /::|\|/.exec(text.value);
  if (!separator) return;
  const styles = text.value.slice(3, separator.index).split(",");
  const value = text.value.slice(separator.index + separator[0].length);
  if (!value.trim() || styles.length > 6 || new Set(styles).size !== styles.length) return;
  const classes: string[] = [];
  const groups = new Set<string>();
  for (const style of styles) {
    const className = NOTE_STYLE_CLASSES.get(style);
    if (!className) return;
    const group = className.startsWith("font-")
      ? style === "mono" || style === "serif"
        ? "family"
        : "weight"
      : style === "small" || style === "large"
        ? "size"
        : className.startsWith("bg-")
          ? "background"
          : style === "underline" || style === "strike"
            ? "decoration"
            : "color";
    if (groups.has(group)) return;
    groups.add(group);
    classes.push(className);
  }
  return {
    type: "element",
    tagName: "span",
    properties: { className: classes },
    children: [{ type: "text", value }],
  };
}

// Runs after sanitization and emits only plain text and known classes.
export function rehypeMarkdownNoteStyles() {
  return (tree: Root) => {
    function visit(parent: Root | Element): void {
      for (const [index, child] of parent.children.entries()) {
        if (child.type !== "element") continue;
        if (child.tagName === "pre" || child.tagName === "a") continue;
        if (child.tagName === "code") {
          const styled = styledSpan(child);
          if (styled) parent.children[index] = styled;
        } else {
          visit(child);
        }
      }
    }
    visit(tree);
  };
}
