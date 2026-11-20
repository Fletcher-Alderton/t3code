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
]);

function styledSpan(code: Element): Element | undefined {
  if (code.children.length !== 1) return;
  const text = code.children[0];
  if (text?.type !== "text" || !text.value.startsWith("t3:")) return;
  const separator = text.value.indexOf("|");
  if (separator === -1) return;
  const styles = text.value.slice(3, separator).split(",");
  const value = text.value.slice(separator + 1);
  if (!value.trim() || styles.length > 4 || new Set(styles).size !== styles.length) return;
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
