---
"@zag-js/hover-card": minor
"@zag-js/tooltip": minor
---

### Safe area

The hover card now tracks the pointer travelling between the trigger and the content.

- The hover card stays open while the pointer moves to the content, even diagonally or pausing past `closeDelay`.
- A hover card opened programmatically or by keyboard is no longer dismissed by pointer movement elsewhere.
- Interactive tooltips (`interactive: true`) use it too, so the pointer can reach them without the tooltip closing (WCAG
  1.4.13). Non-interactive tooltips are unchanged.
- The hover card's `open` and `closing` states are now `open.idle` and `open.closing`. `state.matches("open")` still
  works, but code matching `"closing"` should use `"open.closing"`.

### Inline triggers

- A trigger that wraps across lines anchors the hover card to the hovered line, not the box around every line.
- The hover card moves when the active trigger changes, instead of staying over the previous one.
- Added a `positioning.middleware` option for extra Floating UI middleware.

### Open reason

- Added `reason` to `onOpenChange`, and `api.setOpen` takes one as its second argument (default `script`).

  ```ts
  onOpenChange({ open, reason }) {
    // "trigger-hover" | "trigger-focus" | "trigger-blur" | "pointer-leave"
    // | "interact-outside" | "escape-key" | "script"
  }
  ```

- Dismissing with `Escape` is reported as `escape-key`, not as a press outside.
- Leaving the trigger before the open delay no longer fires `onOpenChange` with `open: false`.
- Focus after a pointer interaction (e.g. a dialog restoring focus to the trigger) no longer opens the hover card. Only
  keyboard and assistive-technology focus do, like the tooltip.
