---
"@zag-js/slider": major
---

- **Breaking:** Replace the `aria-label` and `aria-labelledby` array props with `getAriaLabel` and `getAriaLabelledBy`,
  matching `getAriaValueText`.

  ```diff
    slider.machine({
  -   "aria-label": ["Minimum price", "Maximum price"],
  +   getAriaLabel: ({ index }) => (index === 0 ? "Minimum price" : "Maximum price"),
    })
  ```

- **Breaking:** Leave a disabled slider out of form submission, like a native input.

- Add `disabled` to `getThumbProps` and `getHiddenInputProps` to disable a single thumb.

- Add `inRange` to the marker state and `data-in-range` to markers within the filled range.

- Accept a single number for `thumbSize`, setting both width and height.

- Add `aria-readonly` to the thumbs when `readOnly` is set, and `aria-invalid` and `data-invalid` when invalid.

- Fix thumbs with their own label getting `aria-labelledby` pointing at the label part.

- Fix the range falling short of the thumb's center when `thumbAlignment` is `"contain"`.

- Fix `onValueChangeEnd` firing when an interaction ends on the starting value.

- Fix Page Up, Page Down and Shift + Arrow snapping to multiples of `largeStep` instead of moving by it.

- Fix stacked thumbs getting stuck when `thumbCollisionBehavior` is `"none"`.
