---
"@zag-js/file-upload": patch
---

Fix the hidden input still holding the previous files when `onFileAccept` and `onFileChange` run, so reading the form
(e.g. `new FormData(form)` or `form.requestSubmit()`) from these callbacks now includes the accepted files (fixes
#3700).
