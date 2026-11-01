---
"@zag-js/svelte": patch
---

Fixed issue where a machine skipped a transition when two events were sent in the same task, e.g. moving focus between
slider thumbs left no thumb focused.
