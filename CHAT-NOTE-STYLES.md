# Rich notes in T3 Code chat

Assistant replies can use the existing GitHub-style Markdown (headings, task lists, tables, footnotes, and alerts such as `> [!NOTE]`). They render in the regular scrolling timeline. Use `<details>` with a `<summary>` for collapsible sections. The timeline's activity rows remain the place to expand provider-supplied reasoning summaries and inspect tool inputs and outputs when available; the renderer does not collect any additional private reasoning or tool data.

## Inline styles

Ask the assistant to write a Markdown note and use inline code spans of the form `` `t3:accent,strong|Decision` `` to style short phrases. The characters after the first `|` are plain text. A span can combine at most one style from each column:

| Color                        | Size             | Weight             | Font            | Background          | Decoration            |
| ---------------------------- | ---------------- | ------------------ | --------------- | ------------------- | --------------------- |
| `accent`, `muted`, `warning` | `small`, `large` | `medium`, `strong` | `mono`, `serif` | `highlight`, `chip` | `underline`, `strike` |

Unknown or conflicting styles stay literal code. Ordinary fenced code stays literal. Use ordinary Markdown for links and formatting inside a phrase. Other Markdown renderers will display the extension as inline code. This uses a fixed palette; it does not call a second model or accept arbitrary CSS.

### Try it

Ask the assistant to return the following Markdown verbatim, without wrapping it in a code fence:

```markdown
## Release notes

> [!NOTE]
> `t3:accent,strong|Ready for review` — the changes are on the feature branch.

- [x] Check the formatter
- [ ] Try the desktop build

`t3:muted,small|Last updated today`
```

## Agent-authored Astro UI in chat

Ask the agent to build the UI and publish it directly in the conversation with `html_render`. The same surface supports diagrams, SVG charts, images, video with controls, and interactive layouts. There is no preview card to open and no separate chart syntax.

Astro is the authoring and build tool, not a second browser engine. Use a static build, set `build.inlineStylesheets: "always"` in `astro.config.mjs`, and publish the resulting `.html` with `html_render({ path, title, height, measure: false })`. Use `html` instead of `path` if the agent does not have full file access. Bundle any scripts inline, use absolute media URLs (or embed assets), and prefer static HTML, CSS, and SVG over client-side hydration. Videos should use controls and `preload="none"`. Do not pass the Astro dev-server URL or raw `.astro` source.

The chat renders the artifact in its existing sandboxed HTML surface and adjusts its height in place. With `measure: false`, publishing does not launch headless Chrome just to calculate heights; the supplied `height` is the initial estimate. The optional `html_preview` tool remains useful when the agent wants a screenshot before publishing.

## Run the desktop fork

From the repository root, use the Node version specified in `package.json` and run:

```sh
npx -y pnpm@12.14.0 install --frozen-lockfile
npx -y pnpm@12.14.0 dev:desktop --home-dir "$HOME/.t3-notes-dev" --no-seed
```

The separate home and `--no-seed` keep the stock app and its data untouched. To run in a local browser instead, use `dev` in place of `dev:desktop` and open the URL printed by Vite.
