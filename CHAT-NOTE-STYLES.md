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

## Astro site previews

Ask the assistant to return this fence as part of a reply:

````markdown
```astro-preview
https://your-astro-site.example/
```
````

Click **Load static preview** in chat. Use a deployed HTTPS URL or serve a built Astro site locally (for example, run `npm run build` and `npm run preview` in your Astro project, then use `http://localhost:4321/`). This previews rendered HTML and CSS, not raw `.astro` source. The iframe disables scripts, so JavaScript islands and development-only behavior may not work; **Open site** opens the normal interactive page. Sites that disallow framing must also be opened separately. Only load URLs you trust: the embedded page can still request its own images and styles.

The preview reuses the existing Chromium engine. It makes no page request until clicked, allows one active preview per app window, and unloads when you scroll it fully out of view, hide the tab, or open another preview.

## Run the desktop fork

From the repository root, use the Node version specified in `package.json` and run:

```sh
npx -y pnpm@12.14.0 install --frozen-lockfile
npx -y pnpm@12.14.0 dev:desktop --home-dir "$HOME/.t3-notes-dev" --no-seed
```

The separate home and `--no-seed` keep the stock app and its data untouched. To run in a local browser instead, use `dev` in place of `dev:desktop` and open the URL printed by Vite.
