---
"@zag-js/toast": minor
---

Add support for `action` in toast options, giving you the ability to add a `action.label` and `action.onClick`

```ts
api.create({
  title: "Uploaded successfully",
  type: "success",
  action: {
    label: "Undo",
    onClick: () => {
      console.log("undo")
    },
  },
})
```

The `onClick` function will be called when the user clicks the action trigger.
