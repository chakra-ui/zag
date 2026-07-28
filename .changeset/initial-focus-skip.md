---
"@zag-js/dom-query": minor
"@zag-js/dialog": patch
"@zag-js/drawer": patch
---

Improve initial focus selection in dialogs and drawers. Mark chrome controls with `data-no-autofocus` to skip them, or mark the desired target with `data-autofocus`.

```jsx
<div {...api.getContentProps()}>
  {/* skipped on open, still in tab order */}
  <button {...api.getCloseTriggerProps()} data-no-autofocus>
    Close
  </button>
  <button data-no-autofocus aria-label="Help">
    ?
  </button>

  {/* receives initial focus */}
  <input data-autofocus />
  <button>Save</button>
</div>
```

Priority: `initialFocusEl` → `[data-autofocus]` → first tabbable without `[data-no-autofocus]` → content root.
