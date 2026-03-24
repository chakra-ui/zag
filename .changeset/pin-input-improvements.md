---
"@zag-js/pin-input": minor
---

Major UX overhaul for Pin Input, making it feel polished and predictable for OTP and verification code flows.

- **No more holes**: Delete and Backspace now splice values left instead of leaving empty gaps. Deleting "2" from
  `[1, 2, 3]` yields `[1, 3, ""]` — not `[1, "", 3]`. Cut (`Ctrl+X`) behaves the same way.

- **Smarter focus management**
  - Backspace always moves back: previously it stayed in place on filled slots
  - Click and ArrowRight are clamped to the insertion point: no more accidentally focusing empty slots
  - Same-key skip: retyping the same character advances focus instead of getting stuck
  - Roving tabIndex: Tab/Shift+Tab treats the entire pin input as a single tab stop

- **New keyboard shortcuts**
  - Home / End: jump to the first slot or last filled slot
  - `enterKeyHint`: mobile keyboards show "next" on intermediate slots and "done" on the last

- **New props**
  - `autoSubmit`: automatically submits the owning form when all inputs are filled
  - `sanitizeValue`: sanitize pasted values before validation (e.g. strip dashes from "1-2-3")
