import {
  CHAT_MARKDOWN_REHYPE_PLUGINS,
  CHAT_MARKDOWN_REMARK_PLUGINS,
} from "@t3tools/shared/markdownPipeline";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vite-plus/test";

import { rehypeMarkdownNoteStyles } from "./markdownNoteStyles";
import { createMarkdownRenderer } from "./markdownRenderer";

const render = createMarkdownRenderer({
  remarkPlugins: CHAT_MARKDOWN_REMARK_PLUGINS,
  rehypePlugins: [...CHAT_MARKDOWN_REHYPE_PLUGINS, rehypeMarkdownNoteStyles],
  components: {},
  urlTransform: (url) => url,
});

const html = (source: string) => renderToStaticMarkup(render(source));

describe("note styles", () => {
  it("applies allowlisted colors, sizes, weights and fonts", () => {
    expect(html("`t3:accent,large,strong,serif|Decision` and **next steps**")).toContain(
      '<span class="text-info text-lg font-bold font-serif">Decision</span> and <strong>next steps</strong>',
    );
  });

  it("renders payloads as text, not HTML", () => {
    expect(html('`t3:warning|<img src=x onerror="alert(1)">`')).toContain(
      '<span class="text-warning"><img src=x onerror="alert(1)"></span>',
    );
  });

  it.each(["accent,warning", "accent,accent", "color:red", "constructor", ""])(
    "preserves code with invalid styles: %s",
    (styles) => {
      expect(html(`\`t3:${styles}|Decision\``)).toContain(`t3:${styles}|Decision</code>`);
    },
  );

  it("preserves fenced and linked code", () => {
    const markup = html("```\nt3:accent|demo\n```\n\n[`t3:accent|link`](https://example.com)");
    expect(markup).toContain("<pre><code>t3:accent|demo");
    expect(markup).toContain("t3:accent|link</code></a>");
    expect(markup).not.toContain('class="text-info"');
  });
});
