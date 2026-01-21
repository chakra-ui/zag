---
"@zag-js/steps": minor
---

Add validation and skippable step support:

- `isStepValid(index)`: Block forward navigation when step is invalid (linear mode)
- `isStepSkippable(index)`: Mark steps as optional, bypassing validation
- `onStepInvalid({ step, action, targetStep })`: Callback when navigation is blocked
- `api.isStepValid(index)` / `api.isStepSkippable(index)`: Check step state
- `itemState.isValid()`: Lazy validation check per step
