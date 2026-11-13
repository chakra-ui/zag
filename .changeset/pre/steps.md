---
"@zag-js/steps": major
---

- **Breaking:** Define steps with an `items` array and address them by string `value` instead of index.

  ```diff
    steps.machine({
  -   count: 3,
  -   defaultStep: 0,
  +   items: [{ value: "shipping" }, { value: "gift", optional: true }, { value: "payment" }],
  +   defaultValue: "shipping",
    })
  ```

  | Before                                      | After                                         |
  | ------------------------------------------- | --------------------------------------------- |
  | `step` / `defaultStep`                      | `value` / `defaultValue`                      |
  | `onStepChange` / `onStepComplete`           | `onValueChange` / `onComplete`                |
  | `isStepValid(index)`                        | `invalid` on the item                         |
  | `isStepSkippable(index)`                    | `optional` on the item, plus `skipTrigger`    |
  | `onStepInvalid`                             | `onNavigationBlocked` (`reason`, `blockedBy`) |
  | `api.setStep(index)`                        | `api.setValue(value)`                         |
  | `api.isCompleted`                           | `api.complete`                                |
  | `step === count` (completed screen)         | `value === steps.COMPLETE`                    |
  | `getContentProps({ index: count })`         | `getContentProps({ value: steps.COMPLETE })`  |
  | `api.isStepValid` / `isStepSkippable`       | `api.getItemState({ value })`                 |
  | `{ index }` in part props                   | `{ value }`                                   |
  | `itemState.skippable` / `isValid()`         | `itemState.optional` / `!itemState.invalid`   |
  | `itemState.first` / `itemState.last`        | `index === 0` / `index === api.count - 1`     |
  | `ids.triggerId(index)` / `contentId(index)` | `(value) => string`                           |
  | `--percent`                                 | `--steps-percent`                             |

- Add `disabled` and `editable` item flags, and optional `title` and `description`.

- Add `translations` with `progressLabel` and `progressText`. The progress bar announces the current step's `title`.

- Make `completedValues` controllable, so going back no longer marks later steps incomplete.

- Add `api.items`. Pass your item type to `connect` to keep extra fields typed.

- Add the `skipTrigger` part, and `data-invalid`, `data-optional`, `data-skipped`, `data-locked` and `data-disabled`.

- Add keyboard support to the step list: arrow keys, `Home` and `End` move focus, and `Enter` or `Space` opens a step.

- Disable unreachable triggers in linear mode.

- Make the completed content a focusable region, and move focus to it on finish.

- Give the progress bar an accessible name.
