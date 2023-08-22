# CHANGELOG

All notable changes to this project will be documented in this file.

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

## [0.16.0] - 2023-08-13

## Fixed

- Fix issue in **Select** where interaction outside and positioning does not work when select content is conditionally
  rendered

## Changed

- Remove `id` usage in **pressable** for better composition
- Renamed **radio** `getRadioInputProps` to `getRadioHiddenInputProps`
- Rename **tablist** part to list to match naming convention

## [0.15.0] - 2023-08-08

## Changed

- Rename inputProps to hiddenInputProps. input is no longer part of the **checkbox** anatomy
- Machines no longer export hiddenInput as part of their anatomy API
- Add option group label to **Combobox**
- **Tabs** no longer export a content group.

## [0.14.0] - 2023-08-07

## Fixed

- Improve outside interaction logic to avoiding closing **dialog** elements when interacting with browser extensions
  like grammarly or 1password.
- Rename **File Upload** `minSize` and `maxSize` to `minFileSize` and `maxFileSize` respectively
- Rename **File Upload**`api.openFilePicker` to `api.open`

## Changed

- **BREAKING:** Rename **Carousel** `nextTrigger`, `prevTrigger` to `nextSlideTrigger` and `prevSlideTrigger` parts
- Add positioner part to date picker machine to allow dynamic positioning.

## Added

- Provide interaction event handlers (`onPointerdownOutside`, `onFocusOutside` and `onInteractOutside`) to better manage
  outside interaction.

> Affected machines, `combobox`, `editable`, `menu`, `select`, `tags-input`.

## [0.13.0] - 2023-07-25

## Fixed

- Fix issue in **Color Picker** where `isEqual` doesn't consider alpha channel.
- Fix keyboard navigation in **Color Picker** between area and channel slider thumb.
- Fix issue in **Combobox**, **Select**, **Menu**, **Hover Card** where `sameWidth` doesn't work consistently in Vue.js
  and Solid.js during re-render.
- Add `data-disabled` to **File Upload** parts
- Add `data-focus` to the **NumberInput** parts
- Set `portalled` attribute to be `true` by default in **Popover**
- Add `data-orientation` to all parts in **Radio Group**
- Remove unimplemented `setPreviousValue` action in **Radio Group**

## Changed

- Add support for transforming context before settings it in the machine's context. This is useful when some values need
  to passed to `ref` function

- Add option to setting toast default options like placement, removeDelay, duration, etc

## Added

- Introduce new ToggleGroup machine

## [0.12.0] - 2023-07-16

## Fixed

- Fix issue in **Avatar** where avatar doesn't show fallback when image src is initially empty
- Fix issue in **Color Picker** where focusing on area thumb doesn't transition to focused state, making keyboard
  navigation not work.
- Fix issue in **Switch** where `api.setChecked` does not work for Checkbox and Switch components

## Changed

- **Breaking**: Add `data-state` attribute to allow styling the open/closed state or checked/unchecked states

  We replaced `data-expanded` or `data-checked` to `data-state` attribute

  - `data-expanded` maps to `data-state="open"` or `data-state="closed"`
  - `data-checked` maps to `data-state="checked"` or `data-state="unchecked"`
  - `data-indeterminate` maps to `data-state="indeterminate"`
  - `data-open` maps to `data-state="open"`

## [0.11.2] - 2023-07-13

## Fixed

- Fix issue where machine types were not being properly inferred

## [0.11.1] - 2023-07-12

## Fixed

- Expose the types and add `onClick` to **carousel** indicator
- Fix types exports in **ColorPicker**

## [0.11.0] - 2023-07-11

## Fixed

- Fix issue in **Editable** where initially cancelling the value by pressing the escape key doesn't work
- Fix issue in in **Tooltip** where it re-opens after clicking the trigger and moving the cursor slightly.

## Changed

Revert build tooling from `vite` to `tsup`

## Added

- Introduce new animate presence machine to manage mount/unmount animation.

## [0.10.5] - 2023-07-06

## Fixed

- Fix an issue where type declarations aren't inferred correctly

## [0.10.4] - 2023-07-05

## Fixed

- Fix issue where **RadioGroup** indicator part does not transition its size and position after first render

## [0.10.3] - 2023-06-30

## Fixed

- Improve DOM detection code to rely on `document` instead of `window`
- Fix issue where `offset` is ignored from default gutter in **Popper**

## [0.10.2] - 2023-06-01

## Fixed

- Fix issue where anatomy was not exported in **Avatar**
- Set the panel's default `minSize` to `0` in **Splitter**

## [0.10.1] - 2023-05-31

## Fixed

Fix issue where `api` for controlling panel sizes wasn't implemented in **splitter** machine.

## [0.10.0] - 2023-05-31

## Fixed

- Fix issue where **Checkbox** and **Switch** emits `onClick` twice when parent element is clicked
- Fix issue where entering value in between input character moves cursor to the end in **Combobox**.
- Fix issue where non-ascii characters could not be entered in **Combobox**, **NumberInput**
- Fix scroll hijacking issue in **Date Picker**, **Dialog** during initial and return focus
- Upgrade `focus-trap` package to ensure that trap works when the active element within the content is removed in
  **Dialog**
- Fix scroll hijacking issue during initial and return focus
- Ensure consistent behavior between space and enter key in **Pressable**

## Changed

- The `createAnatomy` function has been updated to return an array of the anatomy instance's part names

## Added

- Add avatar machine to handle the loading and fallback states of an **avatar** image

## [0.9.2] - 2023-05-18

## Fixed

- Fix issue in **ColorPicker, Menu, NumberInput, Slider, RangeSlider, RatingGroup** where event point calculation is
  incorrect when the page is scrolled
- Fix issue where `setReturnFocus` used in `focus-trap` throws a console error in **Dialog**
- Fix issue where default value is always overriden with an array with empty strings when the **PinInput** component is
  mounted.

## [0.9.0] - 2023-05-16

## Fixed

- Add transient updates to svelte `useMachine`
- Refactor machines to wire out state and transitions correctly
- Fix inconsistencies in **DatePicker** api methods and naming conventions
- Remove unused attributes in **Switch** and make it consistent with checkbox
- Remove unneeded style property on **tabs** indicator (depending on orientation)
- Fix bug where keyboard navigation doesn't work in **Tabs** manual activation mode

## Changed

- Add support for renaming component scope/name

## [0.7.0] - 2023-05-03

## Fixed

- Ensure ids of underlying elements can customized based on `ids` context property.
- Fix issue in **Editable** where focus is hijacked on blur when interacting outside on a focusable element
- Refactor regex for `mergeProps` in zag core.
- Improve reactivity of `mergeProps` function in the SolidJS adapter
- Improve support for spacing and slides per view in **Carousel**
- Export types for color channel and swatch parts in **ColorPicker**
- Update the `setPositioning` api method to allow empty arguments in **Popover, Menu, Tooltip, HoverCard**
- Ensure consistent props for marker in **`Slider`** and **`RangeSlider`**
- Export types for panel and resize trigger props in **Splitter**

## Changed

- Add `finalFocusEl` to allow for better return focus management in **Editable**
- Add `type` property to the pagination's context to control properties used in trigger elements in **Pagination**

## [0.6.0] - 2023-04-15

### Fixed

- Fix issue in Vue where `defaultValue` does not get applied to input element. The fix was to normalize `defaultValue`
  to `value`
- Fix issue in **Checkbox** where checkbox `toggleChecked` was not defined
- Fix issue in **DatePicker** where `focusedValue` was not synced with `value` property.
- Fix issue in **DatePicker** where input value was not updated when `locale` and `value` changed.
- Update point calculations in **RatingGroup**, **Splitter** based on changes in `getRelativePointPercent` output

### Changed

- Rename **HoverCard** and **Popover** `onOpenChange` to `onOpen` and `onClose`

### Added

- Initial release of the color utilities and picker.

## [0.5.0] - 2023-04-11

### Fixed

- Fix for Svelte style attribute ( now included in the use directive rather than the native spread )
- Fix for Svelte handlers not being updated correctly ( we used to attach them once the connect is init, but they need
  to be updated for each change of the api )
- Renamed Svelte `attributes` to `attrs`
- Fix Svelte handlers and attributes types for `normalizeProps`

### Changed

- Ensure all packages are versioned together
- Remove the **Checkbox** `defaultChecked` property in favor of the `checked` property that can now be controlled.

```jsx
// the checkbox will be checked initially
const [state, send] = useMachine(
  checkbox.machine({
    id: "1",
    checked: true,
  }),
)

// this will update the checkbox when the `checked` value changes
const [state, send] = useMachine(checkbox.machine({ id: "1" }), {
  context: {
    // when this value changes, the checkbox will be checked/unchecked
    checked: true,
  },
})
```

- Remove the **Dialog** `defaultOpen` property in favor of the `open` property that can now be controlled.

```jsx
// this is will open the dialog initially
const [state, send] = useMachine(dialog.machine({ id: "1", open: true }))

// this will open the dialog when the `open` value changes
const [state, send] = useMachine(dialog.machine({ id: "1" }), {
  context: {
    // when this value changes, the dialog will open/close
    open: true,
  },
})
```

- Remove the **HoverCard** `defaultOpen` property in favor of the `open` property that can now be controlled.

```jsx
// this is will open the hoverCard initially
const [state, send] = useMachine(hoverCard.machine({ id: "1", open: true }))

// this will open the hoverCard when the `open` value changes
const [state, send] = useMachine(hoverCard.machine({ id: "1" }), {
  context: {
    // when this value changes, the hoverCard will open/close
    open: true,
  },
})
```

- Remove the **Popover** `defaultOpen` property in favor of the `open` property that can now be controlled.

```jsx
// this is will open the popover initially
const [state, send] = useMachine(popover.machine({ id: "1", open: true }))

// this will open the popover when the `open` value changes
const [state, send] = useMachine(popover.machine({ id: "1" }), {
  context: {
    // when this value changes, the popover will open/close
    open: true,
  },
})
```

- Remove the **Switch** `defaultChecked` property in favor of the `checked` property that can now be controlled.

```jsx
// the switch will be checked initially
const [state, send] = useMachine(
  switch.machine({
    id: "1",
    checked: true,
  }),
)

// this will update the switch when the `checked` value changes
const [state, send] = useMachine(switch.machine({ id: "1" }), {
  context: {
    // when this value changes, the switch will be checked/unchecked
    checked: true,
  },
})
```

- Remove the **Tooltip** `defaultOpen` property in favor of the `open` property that can now be controlled.

```jsx
// this is will open the tooltip initially
const [state, send] = useMachine(tooltip.machine({ id: "1", open: true }))

// this will open the tooltip when the `open` value changes
const [state, send] = useMachine(tooltip.machine({ id: "1" }), {
  context: {
    // when this value changes, the tooltip will open/close
    open: true,
  },
})
```
