---
"@zag-js/file-utils": patch
---

Fix issue where the browser might not be able to infer the mime type of a file due to limitations, drag source or
security restrictions. When this happens, the file type is set to `""`.

As a fallback in the file validation logic, we now infer the mime type from the file extension.
