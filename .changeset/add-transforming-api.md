---
"@zag-js/file-upload": minor
---

Add `api.transforming` to track file transformation state when using `transformFiles`. This enables developers to show
loading states during file processing.

```tsx
const service = useMachine(fileUpload.machine, {
  // 1. Define a function to transform the files
  transformFiles: async (files) => {
    return files.map((file) => {
      return new File([file], file.name, { type: file.type })
    })
  },
})

// 2. Connect the service to the component
const api = fileUpload.connect(service, normalizeProps)

// 3. Show loading indicator when files are being transformed
if (api.transforming) {
  return <div>Transforming files...</div>
}
```
