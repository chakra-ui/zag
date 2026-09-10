---
"@zag-js/file-upload": patch
"@zag-js/file-utils": patch
---

Fix dropping a large directory freezing the tab. Duplicate detection compared every incoming file against every file
accepted so far, and the `accept` list was re-parsed for every file, so a folder with tens of thousands of files took
tens of seconds before `onFileAccept` or `onFileReject` fired. Ingesting 50,000 files now takes milliseconds.
