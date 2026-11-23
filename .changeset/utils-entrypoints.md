---
"@zag-js/utils": major
"@zag-js/types": minor
"@zag-js/color-picker": patch
"@zag-js/file-upload": patch
"@zag-js/date-input": patch
"@zag-js/date-picker": patch
"@zag-js/scheduler": patch
"@zag-js/number-input": patch
---

- Move `@zag-js/color-utils` to `@zag-js/utils/color`, `@zag-js/file-utils` to `@zag-js/utils/file` and
  `@zag-js/date-utils` to `@zag-js/utils/date`. The old packages are removed. `@internationalized/date` is an optional
  peer dependency, needed only for `@zag-js/utils/date`.
- Add entrypoints by topic: `array`, `functions`, `guard`, `number`, `object` and `store`. The root still exports them
  all.
- Add `decimalsOf` and `snapValueToStepDirection`.
- Remove unused helpers: `fromLength`, `isValueAtMax`, `isValueAtMin`, `getNextStepValue`, `getPreviousStepValue`,
  `getValueSetterAtIndex`, `getClosestValue`, `getClosestValueIndex`, `getMinValueAtIndex`, `getMaxValueAtIndex`,
  `getValueTransformer` and `roundValue`.
- Move the `Teardown` and `TeardownReason` types from `@zag-js/utils` to `@zag-js/types`.
