---
"@zag-js/signature-pad": patch
---

- Draw every coalesced point, for smoother strokes.

- Fix `getDataUrl` never settling when the image fails to load; it now rejects.

- Follow only the pointer that started a drag.
