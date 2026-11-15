# Forms

Zag components aren't native form controls, so each one that holds a value renders a hidden native input that the form
submits. Pass `name` (and `form` when the component sits outside the `<form>`) to the machine, then render the hidden
part. Without it, the value never reaches `FormData`.

| Component                                                                                                  | Hidden part                                                                                                            |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Checkbox, switch                                                                                           | `<input {...api.getHiddenInputProps()} />` inside the root                                                             |
| Radio group                                                                                                | `<input {...api.getItemHiddenInputProps({ value })} />` in each item                                                   |
| Select                                                                                                     | `<select {...api.getHiddenSelectProps()}>` with an `<option value>` for each item, so the browser can submit the value |
| Combobox                                                                                                   | `<input {...api.getHiddenInputProps()} />`, or one per value with `multiple` (below)                                   |
| Slider                                                                                                     | `<input {...api.getHiddenInputProps({ index })} />` in each thumb                                                      |
| Date input                                                                                                 | `<input {...api.getHiddenInputProps()} />`, or `({ index })` for each date of a range                                  |
| Signature pad                                                                                              | `<input {...api.getHiddenInputProps({ value: dataUrl })} />`, with the drawing as a data URL                           |
| Angle slider, number input, pin input, tags input, color picker, rating group, file upload, cascade select | `<input {...api.getHiddenInputProps()} />`                                                                             |

Multiple combobox values submit as separate entries:

```tsx
<>
  {api.value.map((value) => (
    <input key={value} {...api.getHiddenInputProps({ value })} />
  ))}
</>
```

## What gets submitted

- Select and combobox submit the item's value from `itemToValue`, not its label.
- A combobox with `allowCustomValue` submits typed text that matches no item.
- Checkbox submits `value` (default `"on"`) when checked, like a native checkbox.

## Validation and state

- `required`, `invalid`, `disabled` and `readOnly` are machine props. They set the matching ARIA and data attributes on
  every part.
- `@zag-js/field` and `@zag-js/fieldset` connect a label, description and error message to the control inside them, and
  a disabled fieldset disables every control in it.
