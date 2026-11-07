# Components: every state

A component is finished when every state is designed. Snippets use tokens from
`assets/tokens.css`; translate to Tailwind utilities or your framework as needed.

## Button

```css
.btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
  min-height: var(--tap-min); padding-inline: var(--space-5);
  font: 600 var(--text-sm) / 1 var(--font-body);
  border: 1px solid transparent; border-radius: var(--radius-sm); cursor: pointer;
  transition: background-color var(--dur-fast) var(--ease-out), transform var(--dur-instant) var(--ease-out);
}
.btn-primary { background: var(--color-accent); color: var(--color-on-accent); }
.btn-secondary { background: transparent; color: var(--color-text); border-color: var(--color-border-strong); }
@media (hover: hover) {
  .btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
  .btn-secondary:hover:not(:disabled) { background: var(--color-surface); }
}
.btn:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn[aria-busy="true"] { cursor: progress; }
.btn[aria-busy="true"] .label { visibility: hidden; }           /* keep width, show spinner over it */
.btn[aria-busy="true"]::after { content: ""; position: absolute; width: 1em; height: 1em; border: 2px solid currentColor;
  border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

```tsx
<button className="btn btn-primary" disabled={pending} aria-busy={pending}>
  <span className="label">Start free trial</span>
</button>
```

One primary button per view; verb labels ("Save changes", not "OK"); loading keeps the width.

## Text input

```css
.field { display: grid; gap: var(--space-2); }
.field label { font-weight: 600; font-size: var(--text-sm); }
.input {
  min-height: var(--tap-min); padding-inline: var(--space-3);
  font: inherit; font-size: max(16px, var(--text-base));  /* <16px makes iOS zoom on focus */
  color: var(--color-text); background: var(--color-surface-raised);
  border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm);
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.input::placeholder { color: var(--color-text-muted); }
@media (hover: hover) { .input:hover:not(:disabled) { border-color: var(--color-text-muted); } }
.input:focus-visible { outline: none; border-color: var(--color-focus); box-shadow: 0 0 0 3px oklch(from var(--color-focus) l c h / 0.3); }
.input[aria-invalid="true"] { border-color: var(--color-danger); }
.input:disabled { background: var(--color-surface); color: var(--color-text-muted); cursor: not-allowed; }
.hint { font-size: var(--text-sm); color: var(--color-text-muted); }
.error { font-size: var(--text-sm); color: var(--color-danger); display: flex; gap: var(--space-1); }
```

Error text includes an icon and words; the red border alone is not enough. See
`accessibility.md` section 6 for the markup.

## Card

```html
<article class="card">
  <img src="/plans/team.webp" alt="" width="640" height="360" loading="lazy" decoding="async" />
  <h3><a href="/plans/team" class="card-link">Team plan</a></h3>
  <p>Shared workspaces, SSO, and audit logs for up to 50 people.</p>
</article>
```
```css
.card { position: relative; display: grid; gap: var(--space-3); padding: var(--space-5);
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.card img { aspect-ratio: 16 / 9; object-fit: cover; border-radius: var(--radius-sm); }
.card-link::after { content: ""; position: absolute; inset: 0; }  /* whole card clickable, one tab stop */
.card:has(.card-link:focus-visible) { outline: 2px solid var(--color-focus); outline-offset: 2px; }
.card-link:focus-visible { outline: none; }
```

Don't wrap a card in `<a>` if it holds other links; use the stretched link. Pick one of image, shadow, border.

## Modal (native dialog)

```html
<button type="button" id="open-delete">Delete project</button>
<dialog id="confirm-delete" aria-labelledby="cd-title">
  <form method="dialog" class="stack">
    <h2 id="cd-title">Delete "Atlas"?</h2>
    <p>This removes 14 files and cannot be undone.</p>
    <div class="cluster">
      <button value="cancel" class="btn btn-secondary" autofocus>Cancel</button>
      <button value="confirm" class="btn btn-danger">Delete project</button>
    </div>
  </form>
</dialog>
<script>
  const d = document.getElementById("confirm-delete");
  document.getElementById("open-delete").onclick = () => d.showModal();
  d.onclose = () => d.returnValue === "confirm" && deleteProject();
</script>
```
```css
dialog { width: min(100% - 2 * var(--space-4), 28rem); padding: var(--space-6); border: 0;
  border-radius: var(--radius-lg); background: var(--color-surface-raised); color: var(--color-text); box-shadow: var(--shadow-lg); }
dialog::backdrop { background: oklch(15% 0.01 60 / 0.55); }
body:has(dialog[open]) { overflow: hidden; }
```

`showModal()` gives focus trapping, Esc to close, inert background, and top layer.
Focus returns to the opener on close. Destructive dialogs autofocus the safe option.

## Table

```html
<div class="table-wrap" role="region" aria-labelledby="inv-caption" tabindex="0">
  <table>
    <caption id="inv-caption">Invoices, last 90 days</caption>
    <thead><tr><th scope="col">Invoice</th><th scope="col">Date</th><th scope="col" class="num">Amount</th><th scope="col">Status</th></tr></thead>
    <tbody><tr><td>INV-2041</td><td>12 Oct 2026</td><td class="num">$1,280.00</td><td><span class="badge badge-success">Paid</span></td></tr></tbody>
  </table>
</div>
```
```css
.table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
caption { text-align: start; padding: var(--space-3) var(--space-4); font-weight: 600; }
th, td { padding: var(--space-3) var(--space-4); text-align: start; border-bottom: 1px solid var(--color-border); }
th { position: sticky; top: 0; background: var(--color-surface); font-weight: 600; color: var(--color-text-muted); }
.num { text-align: end; font-variant-numeric: tabular-nums; }
@media (hover: hover) { tbody tr:hover { background: var(--color-surface); } }
```

The wrapper is focusable so keyboard users can scroll it. Sortable: `<button>` in `<th>`, `aria-sort` on `<th>`.

## Loading, empty, and error states

```tsx
if (status === "loading") return <TableSkeleton rows={5} />;          // same height as real rows
if (status === "error") return (<div role="alert" className="state">
  <p>We couldn't load invoices.</p> <button className="btn btn-secondary" onClick={retry}>Try again</button></div>);
if (invoices.length === 0) return (<div className="state">
  <h3>No invoices yet</h3> <p>Invoices appear here after your first billing cycle on 1 Dec.</p>
  <a className="btn btn-primary" href="/billing">Set up billing</a></div>);
```

Empty states explain why it is empty and what to do next. Error states say what
failed in plain words and offer a retry; never show raw error objects or stack traces.
