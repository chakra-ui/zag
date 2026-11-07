---
"@zag-js/number-input": major
---

- **Breaking change:** Make the value a number instead of a string, with `null` for an empty input. `api.value` and the
  `value` in every callback are now numbers. Read the text from `formattedValue`. `valueAsNumber` is removed.

  Migration: store a `number | null`, and replace `valueAsNumber` with `value`.

  ```diff
  - const [value, setValue] = useState("")
  + const [value, setValue] = useState<number | null>(null)

    useMachine(numberInput.machine, {
      value,
      onValueChange(details) {
        setValue(details.value)
      },
    })

  - api.valueAsNumber
  + api.value
  ```

- **Breaking change:** Submit the raw number through a hidden input instead of the formatted text. The hidden input also
  validates `min` and `max` and accepts browser autofill, reported with the new `"autofill"` reason.

  Migration: render the hidden input when you set `name`.

  ```diff
    <input {...api.getInputProps()} />
  + <input {...api.getHiddenInputProps()} />
  ```

- **Breaking change:** Remove the default `min` and `max`. Home and End no longer jump to ±`Number.MAX_SAFE_INTEGER`.

  Migration: pass `min` and `max` if you relied on the defaults.

  ```diff
    useMachine(numberInput.machine, {
  +   min: Number.MIN_SAFE_INTEGER,
  +   max: Number.MAX_SAFE_INTEGER,
    })
  ```

- **Breaking change:** Render the input as a text field instead of a spinbutton, so VoiceOver on iOS can reach the
  steppers. This removes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` and
  `translations.valueText`.

  Migration: remove `translations.valueText`.

  ```diff
    translations: {
  -   valueText: (value) => `${value} units`,
    },
  ```

- **Breaking change:** Replace `allowOverflow` and `clampValueOnBlur` with `allowOutOfRange`. When set, a typed value
  outside the range is kept and reported as invalid instead of being clamped on blur or Enter. Stepping now always stays
  within the range.

  Migration: replace `clampValueOnBlur: false` with `allowOutOfRange: true`, and remove `allowOverflow`.

  ```diff
  - allowOverflow: true,
  - clampValueOnBlur: false,
  + allowOutOfRange: true,
  ```

- **Breaking change:** Remove the internal `HintValue` type.

  Migration: remove any import of it. It has no replacement.

- Add `translations.roleDescription`, defaulting to "number field". It is left out on iOS, where VoiceOver would skip
  the required state.

- Add `Shift` + wheel to step by `largeStep` and `Alt` + wheel to step by `smallStep`.

- Fix the input keeping the typed text when a controlled parent clamps or refuses the change.

- Fix `onValueCommit` firing when nothing changed, such as a blur without edits or a step at the max.

- Fix `onValueCommit` reporting the previous value when the value is controlled.

- Fix the steppers ignoring screen readers, which press a button without a pointer.

- Fix the mouse wheel blocking horizontal page scrolling.

- Fix `snapOnStep` skipping a step, so 5.5 went to 7, and never reaching a `min` or `max` off the step grid.

- Fix scrubbing stopping after one step when `scrubberPixelSensitivity` is 0.

- Fix scrubbing stopping after one step in Vue and Svelte.

- Fix the `locale` being ignored without `formatOptions`, which read "1,5" as 1 in German.

- Fix Vue, Svelte and Solid dropping a trailing decimal point while typing.

- Fix the caret and selection being lost when the value syncs unchanged.

- Fix Enter committing an out-of-range value without clamping it.

- Fix Persian digits, the Unicode minus and full-width punctuation from CJK keyboards being rejected.

- Fix a minus being accepted when `min` is 0 or more.

- Fix iPhone users being unable to type a negative number.

- Fix a pinch-zoom over a focused input changing the value.

- Fix the wheel and scrubber changing a read-only value.

- Fix a page scroll that starts on a stepper changing the value. A touch now steps on release.

- Start stepping an empty field from 0, clamped to the range.

- Wait 400ms before repeating a held stepper, then repeat every 60ms.
