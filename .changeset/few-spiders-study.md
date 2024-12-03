---
"@zag-js/file-upload": patch
---

Expose `acceptedFiles` and `rejectedFiles` to validate file method. This is useful for checking for duplicate files.

```ts
fileUpload.machine({
  validate(file, details) {
    const { acceptedFiles, rejectedFiles } = details
    // Check for duplicate files by comparing names in acceptedFiles
    const duplicate = acceptedFiles.some((item) => item.name === file.name)
    if (duplicate) return ["FILE_EXISTS"]
    return null // No errors
  },
})
```
