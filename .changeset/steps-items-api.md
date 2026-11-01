---
"@zag-js/steps": major
---

**Breaking:** Steps are now defined by an `items` array and addressed by string `value` instead of index, e.g.
`items: [{ value: "shipping" }, { value: "gift", optional: true }]`.

### Migration

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

- The step list has keyboard support: arrow keys, `Home` and `End` move focus, and `Enter` or `Space` opens the step.
- Unreachable triggers in linear mode are now disabled.
- The completed content is a focusable region instead of a `tabpanel` labelled by a missing trigger, and finishing moves
  focus to it.
- The progress bar has an accessible name.
- `--steps-percent` replaces `--percent`, which collided with the progress machine's variable.
