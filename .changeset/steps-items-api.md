---
"@zag-js/steps": major
---

**Breaking:** Steps are now defined by an `items` array and addressed by string `value` instead of index.

### Migration

```tsx
// Before
const service = useMachine(steps.machine, {
  count: 3,
  defaultStep: 0,
  onStepChange({ step }) {},
  isStepValid: (index) => isValid[index],
  isStepSkippable: (index) => index === 1,
})
api.setStep(2)
api.getItemProps({ index: 0 })

// After
const service = useMachine(steps.machine, {
  items: [{ value: "shipping" }, { value: "gift", optional: true }, { value: "payment", invalid: !isCardValid }],
  defaultValue: "shipping",
  onValueChange({ value }) {},
})
api.setValue("payment")
api.getItemProps({ value: "shipping" })
```

| Before                                      | After                                                           |
| ------------------------------------------- | --------------------------------------------------------------- |
| `count`                                     | `items`                                                         |
| `step` / `defaultStep`                      | `value` / `defaultValue`                                        |
| `onStepChange`                              | `onValueChange`                                                 |
| `onStepComplete`                            | `onComplete`                                                    |
| `isStepValid(index)`                        | `invalid` on the item                                           |
| `isStepSkippable(index)`                    | `optional` on the item, plus `skipTrigger`                      |
| `onStepInvalid`                             | `onNavigationBlocked` (`reason`, `blockedBy`)                   |
| `api.setStep(index)`                        | `api.setValue(value)`                                           |
| `api.isCompleted`                           | `api.complete`                                                  |
| `step === count` (completed screen)         | `value === steps.COMPLETE`                                      |
| `getContentProps({ index: count })`         | `getContentProps({ value: steps.COMPLETE })`                    |
| `api.isStepValid` / `isStepSkippable`       | `api.getItemState({ value })`                                   |
| `{ index }` in part props                   | `{ value }`                                                     |
| `itemState.incomplete`                      | `[data-incomplete]`, or not `current`, `completed` or `skipped` |
| `itemState.first` / `itemState.last`        | `index === 0` / `index === api.count - 1`                       |
| `itemState.skippable` / `isValid()`         | `itemState.optional` / `!itemState.invalid`                     |
| `ids.triggerId(index)` / `contentId(index)` | `(value) => string`                                             |
| `--percent`                                 | `--steps-percent`                                               |

### New

- Item flags: `disabled` removes a step from the flow and progress, `editable: false` locks a completed step.
- Optional `title` and `description` on items. The progress bar announces the current step's `title`.
- `translations` prop with `progressLabel` and `progressText` for the progress bar.
- `completedValues` is controllable state, so going back no longer marks later steps incomplete.
- `api.items` lists the steps in the flow. Pass your item type to `connect` to keep extra fields typed.
- `skipTrigger` part, and `data-invalid`, `data-optional`, `data-skipped`, `data-locked` and `data-disabled` attributes.

### Fixes

- Fixed issue where the step list had no keyboard support. Arrow keys, `Home` and `End` move focus; `Enter` or `Space`
  opens the step.
- Fixed issue where unreachable triggers in linear mode were enabled but did nothing.
- Fixed issue where the completed content was a `tabpanel` labelled by a trigger that did not exist. It is now a
  focusable region, and finishing moves focus to it.
- Fixed issue where the progress bar had no accessible name.
- Fixed issue where `--percent` collided with the progress machine's variable.
