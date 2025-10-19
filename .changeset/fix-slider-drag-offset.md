---
"@zag-js/slider": patch
---

Fix issue where slider thumb offset changes dynamically during drag, causing unexpected value jumps. The thumb now
maintains a constant offset from the pointer throughout the drag operation, matching the initial grab position.
