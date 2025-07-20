---
"@zag-js/file-upload": minor
---

Add support for programmatically controlling the accepted files via `acceptedFiles` and `defaultAcceptedFiles`

```tsx
const service = useMachine(fileUpload.machine, {
  defaultAcceptedFiles: [new File(["test"], "test.txt", { type: "text/plain" })],
})
```
