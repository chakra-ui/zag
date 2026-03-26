---
"@zag-js/cascade-select": minor
---

Add support for multiple triggers in Cascade Select.

A single component instance can now be shared across multiple trigger elements. Each trigger is identified by a `value` passed to `getTriggerProps`.

**New props:**
- `triggerValue` / `defaultTriggerValue` – controlled or uncontrolled active trigger value
- `onTriggerValueChange` – callback when the active trigger changes

**API additions:**
- `api.triggerValue` – the active trigger value
- `api.setTriggerValue(value)` – programmatically set the active trigger

**Behavior:**
- When the component is open and a different trigger is activated, it switches and repositions without closing
- `aria-expanded` is scoped to the active trigger
- Focus returns to the correct trigger on close
