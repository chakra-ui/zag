---
"@zag-js/file-upload": minor
---

Add support for transforming uploaded files via `transformFiles` context property.

```tsx
const service = useMachine(fileUpload.machine, {
  id: useId(),
  accept: ["image/jpeg", "image/png"],
  transformFiles: async (files) => {
    return Promise.all(files.map((file) => compress(file, { size: 200 })))
  },
})
```
