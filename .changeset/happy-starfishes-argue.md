---
"@zag-js/rating-group": minor
"@zag-js/toggle-group": minor
"@zag-js/radio-group": minor
"@zag-js/tags-input": minor
"@zag-js/accordion": minor
"@zag-js/checkbox": minor
"@zag-js/popover": minor
"@zag-js/select": minor
"@zag-js/menu": minor
---

- Refactor component anatomy to use consistent naming convention across all machines.

  - **Accordion**

    - `getTriggerProps` => `getItemTriggerProps`
    - `getContentProps` => `getItemContentProps`

  - **Radio**

    - `getRadioProps` => `getItemProps`
    - `getRadioControlProps` => `getItemControlProps`
    - `getRadioLabelProps` => `getItemTextProps`
    - `getRatingState` => `getItemState`
    - `getRatingProps` => `getItemProps`

  - **TagsInput**

    - `getTagProps` => `getItemProps`
    - `getTagDeleteTriggerProps` => `getItemDeleteTriggerProps`
    - `getTagInputProps` => `getItemInputProps`

  - **Toggle Group**
    - `getToggleProps` => `getItemProps`

- **ToggleGroup**: Allow deselecting item when `multiple` is `false`.

- Add indicator part to some components for ease of styling. Added `AccordionItemIndicator`, `SelectIndicator`,
  `MenuIndicator`, `PopoverIndicator`
