---
"@zag-js/splitter": patch
---

- Fix clicking a `ResizeTrigger` not moving focus to it, which prevented arrow keys from resizing the splitter until it
  was tab-focused (notably on Safari).
- Fix `data-focus` being applied on hover by only setting it when the trigger is actually focused.
