# Accessibility (WCAG 2.2 AA)

Accessible UI is also better UI: visible focus helps power users, real labels
help everyone, and semantic HTML makes components easier to test.

## 1. Checklist

**Structure**
- [ ] `<html lang="...">` set; one `<h1>`; headings in order (no h2 -> h4 jumps).
- [ ] Landmarks: `<header>`, `<nav aria-label="Main">`, `<main id="main">`, `<footer>`.
- [ ] Skip link as the first focusable element.
- [ ] Lists are `<ul>/<ol>`, tabular data is `<table>` with `<th scope>`.

**Perceivable**
- [ ] Text contrast 4.5:1 (large text 3:1); UI boundaries, icons, focus rings 3:1 (1.4.3, 1.4.11).
- [ ] Meaning never by color alone (1.4.1).
- [ ] Images: meaningful `alt`, or `alt=""` if decorative; icon-only buttons have `aria-label`.
- [ ] Works at 200% zoom and 320px width with no horizontal scroll (1.4.4, 1.4.10).
- [ ] Text spacing overrides do not clip content: avoid fixed heights on text containers (1.4.12).

**Operable**
- [ ] Every action reachable and usable with keyboard alone (2.1.1); no keyboard traps (2.1.2).
- [ ] Visible focus indicator on every focusable element (2.4.7).
- [ ] Focused element not hidden behind sticky headers/footers (2.4.11, new in 2.2).
- [ ] Target size at least 24x24px (2.5.8, new in 2.2). This skill requires 44x44px.
- [ ] Drag interactions have a click alternative (2.5.7, new in 2.2).
- [ ] Moving or auto-updating content can be paused (2.2.2).

**Understandable**
- [ ] Every input has a visible `<label>`; placeholder is not a label.
- [ ] Errors identified in text and linked to the field (3.3.1); suggestions given (3.3.3).
- [ ] Don't ask for the same info twice in one flow (3.3.7, new in 2.2).
- [ ] Login does not require a cognitive test; allow paste and password managers (3.3.8, new in 2.2).
- [ ] Consistent help location across pages (3.2.6, new in 2.2).

**Robust**
- [ ] Custom widgets expose name, role, and state (4.1.2).
- [ ] Status messages announced without moving focus (4.1.3).

## 2. Focus styles

```css
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

/* Inputs: ring that respects radius */
.input:focus-visible { outline: none; border-color: var(--color-focus); box-shadow: 0 0 0 3px oklch(from var(--color-focus) l c h / 0.35); }

/* Windows High Contrast removes box-shadow; keep an outline there */
@media (forced-colors: active) { .input:focus-visible { outline: 2px solid CanvasText; } }
```

`outline: none` is allowed only when another visible indicator replaces it.
Use `:focus-visible`, not `:focus`, so mouse clicks don't show rings but keyboard focus always does.

## 3. Skip link

```html
<a class="skip-link" href="#main">Skip to content</a>
```
```css
.skip-link { position: absolute; left: var(--space-4); top: var(--space-4); transform: translateY(-200%); z-index: var(--z-toast); }
.skip-link:focus-visible { transform: none; }
```

## 4. ARIA: only when HTML can't

First rule of ARIA: use the native element if one exists. `<button>` beats
`<div role="button" tabindex="0">` because it already handles Enter, Space, focus, and disabled.

| Need | Use |
|---|---|
| Action | `<button type="button">` |
| Navigation | `<a href>` |
| Modal | `<dialog>` + `showModal()` (focus trap, Esc, inert background built in) |
| Disclosure | `<details><summary>` or button with `aria-expanded` + `aria-controls` |
| Toggle | `<button aria-pressed="true">` or `<input type="checkbox" role="switch">` |
| Current page in nav | `aria-current="page"` |
| Async status | `<p role="status">` (polite) / `role="alert"` (urgent, errors) |
| Icon-only button | `<button aria-label="Close"><svg aria-hidden="true">` |
| Loading region | `aria-busy="true"` on the container |

Tabs, comboboxes, menus, and tree views need full keyboard patterns. Use a
tested headless library (Radix, React Aria, Headless UI, Melt UI, Bits UI) instead
of hand-rolling them.

## 5. Keyboard support

| Component | Keys |
|---|---|
| Button | Enter, Space |
| Link | Enter |
| Dialog | Tab cycles inside, Esc closes, focus returns to the trigger |
| Menu / listbox | Arrow keys move, Enter selects, Esc closes, Home/End jump |
| Tabs | Left/Right switch tabs, Tab moves into the panel |
| Disclosure | Enter/Space toggle |

Never use positive `tabindex` (1, 2, ...). DOM order is the tab order; fix the DOM.
`tabindex="-1"` is for programmatic focus targets (e.g. a heading after route change).

## 6. Accessible form field

```html
<div class="field">
  <label for="email">Work email</label>
  <input id="email" name="email" type="email" autocomplete="email" required
         aria-invalid="true" aria-describedby="email-hint email-error" />
  <p id="email-hint" class="hint">We'll send the invoice here.</p>
  <p id="email-error" class="error">Enter an email like name@company.com.</p>
</div>
```

- Correct `type` and `autocomplete` give the right mobile keyboard and autofill.
- Set `aria-invalid` only after validation fails, not on first render.
- On submit with errors, move focus to the first invalid field, or to an error summary
  that links to each field.

## 7. Announcements

```html
<div role="status" aria-live="polite" class="visually-hidden" id="announcer"></div>
```
```js
announcer.textContent = "3 results"; // the element must exist before its text changes
```
```css
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
```

## 8. Test it

- Unplug the mouse: Tab through the page; can you see focus and complete the main task?
- Run axe DevTools or Lighthouse accessibility; fix all violations (they catch ~30-40%).
- Zoom to 200% and set window width to 320px.
- Screen reader smoke test: VoiceOver (Cmd+F5) or NVDA; the main flow should make sense.
