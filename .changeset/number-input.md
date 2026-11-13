---
"@zag-js/number-input": major
---

- **Breaking:** The value is a number, with `null` for an empty input. `api.value` and every callback's `value` are
  numbers; read the text from `formattedValue`. `valueAsNumber` is removed.

  ```diff
  - const [value, setValue] = useState("")
  + const [value, setValue] = useState<number | null>(null)

  - api.valueAsNumber
  + api.value
  ```

- **Breaking:** Submit the raw number through a hidden input instead of the formatted text. It validates `min` and `max`
  and accepts browser autofill, reported with the `"autofill"` reason. Render it when you set `name`.

  ```diff
    <input {...api.getInputProps()} />
  + <input {...api.getHiddenInputProps()} />
  ```

- **Breaking:** Remove the default `min` and `max`, so Home and End no longer jump to ±`Number.MAX_SAFE_INTEGER`.

  ```diff
    numberInput.machine({
  +   min: Number.MIN_SAFE_INTEGER,
  +   max: Number.MAX_SAFE_INTEGER,
    })
  ```

- **Breaking:** Render the input as a text field instead of a spinbutton, so VoiceOver on iOS can reach the steppers.
  This removes the `aria-value*` attributes and `translations.valueText`.

  ```diff
    translations: {
  -   valueText: (value) => `${value} units`,
    },
  ```

- **Breaking:** Replace `allowOverflow` and `clampValueOnBlur` with `allowOutOfRange`. An out-of-range typed value is
  kept and reported as invalid instead of clamped. Stepping always stays in range.

  ```diff
  - allowOverflow: true,
  - clampValueOnBlur: false,
  + allowOutOfRange: true,
  ```

- Add `translations.roleDescription`, defaulting to "number field".

- Add `Shift` + wheel to step by `largeStep` and `Alt` + wheel to step by `smallStep`.

- Start stepping an empty field from 0, and wait 400ms before repeating a held stepper.

- Fix the input keeping the typed text when a controlled parent clamps or refuses the change.

- Fix `onValueCommit` firing when nothing changed, and reporting the previous value when controlled.

- Fix the steppers ignoring screen readers, and a page scroll that starts on a stepper changing the value.

- Fix the mouse wheel blocking horizontal page scrolling, and the wheel, scrubber and pinch-zoom changing the value when
  they shouldn't.

- Fix `snapOnStep` skipping a step and never reaching a `min` or `max` off the step grid.

- Fix scrubbing stopping after one step.

- Fix the `locale` being ignored without `formatOptions`, which read "1,5" as 1 in German.

- Fix typing: a trailing decimal point being dropped in Vue, Svelte and Solid, the caret being lost when the value
  syncs, Persian digits and CJK punctuation being rejected, a minus being accepted when `min` is 0 or more, and iPhone
  users being unable to type a negative number.

- Fix Enter committing an out-of-range value without clamping it.

- **Breaking:** Rename the `increment-press` and `decrement-press` change reasons to `increment-trigger` and
  `decrement-trigger`, after the parts that cause them.

  ```ts
  // before
  if (reason === "increment-press") {
  }
  // after
  if (reason === "increment-trigger") {
  }
  ```
