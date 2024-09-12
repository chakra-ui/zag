---
"@zag-js/timer": minor
---

- Introduces new area and control parts for better anatomy and structure.
- [BREAKING] Move `role"timer` to new area part.
- Automatically hide the action triggers based on the action prop passed.

**BEFORE:**

```tsx
<div>
  <div {...api.getRootProps()}>
    <div {...api.getItemProps({ type: "days" })}>{api.formattedTime.days}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
  </div>
  <div>
    <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
    <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
    <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
    <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
  </div>
</div>
```

**AFTER:**

```tsx
<div {...api.getRootProps()}>
  <div {...api.getAreaProps()}>
    <div {...api.getItemProps({ type: "days" })}>{api.formattedTime.days}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
  </div>
  <div {...api.getControlProps()}>
    <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
    <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
    <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
    <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
  </div>
</div>
```
