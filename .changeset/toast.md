---
"@zag-js/toast": minor
---

- Announce toasts through shared live regions: errors assertively, others politely, a burst as one announcement, and an
  update only when its text changes. The group no longer has `aria-live`, and each toast is a `group` instead of a
  `status`.

- Pass the click event to `action.onClick`; call `event.preventDefault()` to keep the toast open.

  ```ts
  const id = toaster.create({
    title: "Message archived",
    action: {
      label: "Undo",
      onClick(event) {
        event.preventDefault() // stays open while the request runs
        undoArchive().then(() => toaster.dismiss(id))
      },
    },
  })
  ```

- Dismiss a toast with a quick flick, even a short one: it must travel more than 8px at 0.3 px/ms or faster.
