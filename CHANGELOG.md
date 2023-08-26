# CHANGELOG

All notable changes to this project will be documented in this file.

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

## [0.17.0] - 2023-08-26

### Fixed

- **React:** Fix issue where spreading props on a `forwardRef` element show a `LegacyRef` error
- **Slider:** Fix issue where slider marks are not aligned to the thumb position in "contain" alignment mode
- **TagsInput**: Ignore key during composition in `onKeyDown` event
- **Combobox, Select, Menu**

  - Fix issue where select clicks underlying element on mobile.
  - Fix issue where combobox and menu option item triggers double click.

- **Form Elements**: Re-enable the input after removing `disabled` attribute from the parent fieldset

### Added

- **Slider:** Add support for passing the `thumbSize` in the machine context to avoid first-render flicker due to DOM
  measurement.

### Changed

> 💥 Breaking changes

- **All machines**: Rename exported `PublicApi` to `Api`
- **Combobox**: Remove `selectInputOnFocus` option in favor of userland control
- **Accordion**: Remove support for passing `value` as `string`. The `value` property must be an array of strings
  `string[]`
- **Tabs**
  - Rename `onHighlight` to `onFocusChange`
  - Remove `onTagUpdate`, use `onChange` instead

## [0.16.0] - 2023-08-13

## Fixed

- **Select**: Fix issue where interaction outside and positioning does not work when select content is conditionally
  rendered

## Changed

- **Pressable**: Remove `id` usage for better composition
- **Radio**: Rename `getRadioInputProps` to `getRadioHiddenInputProps`
- **Tabs**: Rename `tablist` part to `list` to match naming convention

## [0.15.0] - 2023-08-08

## Changed

- **Checkbox**: Rename `inputProps` to `hiddenInputProps`
- **All machines**: Remove `hiddenInput` from machine anatomy
- **Combobox**: Add `optionGroupLabel` part to **Combobox**
- **Tabs**: Remove content group part

## [0.14.0] - 2023-08-07

## Fixed

- **Dialog**: Improve outside interaction logic to avoiding closing when interacting with browser extensions like
  grammarly or 1password.
- **File Upload**
  - Rename `minSize` and `maxSize` to `minFileSize` and `maxFileSize` respectively
  - Rename `api.openFilePicker` to `api.open`

## Changed

> 💥 Breaking changes

- **Carousel:** Rename `nextTrigger`, `prevTrigger` to `nextSlideTrigger` and `prevSlideTrigger` parts
- **DatePicker**: Add positioner part to allow dynamic positioning

## Added

- **Combobox, Editable, Menu, Select, TagsInput**: Provide interaction event handlers (`onPointerdownOutside`,
  `onFocusOutside` and `onInteractOutside`) to better manage outside interaction

## [0.13.0] - 2023-07-25

## Fixed

- **ColorPicker**
  - Fix issue where `isEqual` doesn't consider alpha channel.
  - Fix keyboard navigation in **Color Picker** between area and channel slider thumb.
- **Popper Components**
  - Fix issue in **Combobox**, **Select**, **Menu**, **Hover Card** where `sameWidth` doesn't work consistently during
    re-render.
- **File Upload**: Add `data-disabled` to all element parts
- **NumberInput**: Add `data-focus` to all element parts
- **Popover**: Set `portalled` attribute to be `true` by default
- **RadioGroup**:
  - Add `data-orientation` to all parts
  - Remove unimplemented `setPreviousValue` action

## Changed

- **Core**: Add support for transforming context before settings it in the machine's context. This is useful when some
  values need to passed to `ref` function

- **Toast**: Add option to set toast default options like `placement`, `removeDelay`, `duration`, etc

## Added

- New ToggleGroup machine

## [0.12.0] - 2023-07-16

## Fixed

- **Avatar**: Fix issue where avatar doesn't show fallback when image src is initially empty
- **ColorPicker**: Fix issue where focusing on area thumb doesn't transition to focused state, making keyboard
  navigation not work.
- **Checkbox, Switch**: Fix issue　where `api.setChecked` does not work

## Changed

> 💥 Breaking changes

- **All machines**:

  - Add `data-state` attribute to allow styling the open/closed state or checked/unchecked states
  - We replaced `data-expanded` or `data-checked` to `data-state` attribute

    - `data-expanded` maps to `data-state="open"` or `data-state="closed"`
    - `data-checked` maps to `data-state="checked"` or `data-state="unchecked"`
    - `data-indeterminate` maps to `data-state="indeterminate"`
    - `data-open` maps to `data-state="open"`

## [0.11.2] - 2023-07-13

## Fixed

- **All machines**: Fix issue where machine types were not being properly inferred

## [0.11.1] - 2023-07-12

## Fixed

- **Carousel**: Expose the types and add `onClick` to carousel indicator
- **ColorPicker**: Fix types exports

## [0.11.0] - 2023-07-11

## Fixed

- **Editable**: Fix issue where initially cancelling the value by pressing the escape key doesn't work
- **Tooltip**: Fix issue where it re-opens after clicking the trigger and moving the cursor slightly

## Changed

- **Tooling**: Revert build tooling from `vite` to `tsup`

## Added

- New presense machine to manage mount/unmount animation.

## [0.10.5] - 2023-07-06

## Fixed

- **All machines**: Fix an issue where type declarations aren't inferred correctly

## [0.10.4] - 2023-07-05

## Fixed

- **RadioGroup**: Fix issue where indicator part does not transition its size and position after first render

## [0.10.3] - 2023-06-30

## Fixed

- **All machines**: Improve DOM detection code to rely on `document` instead of `window`
- **Popper**: Fix issue where `offset` is ignored from default gutter

## [0.10.2] - 2023-06-01

## Fixed

- **Avatar**: Fix issue where anatomy was not exported
- **Splitter**: Set the panel's default `minSize` to `0`

## [0.10.1] - 2023-05-31

## Fixed

- **Splitter**: Fix issue where `api` for controlling panel sizes wasn't implemented

## [0.10.0] - 2023-05-31

## Fixed

- **Checkbox, Switch**: Fix issue where root element emits `onClick` twice when parent element is clicked
- **Combobox**
  - Fix issue where entering value in between input character moves cursor to the end
  - Fix issue where non-ascii characters could not be entered
- **DatePicker, Dialog**
  - Fix scroll hijacking issue during initial and return focus
  - Upgrade `focus-trap` package to ensure that trap works when the active element within the content is removed
  - Fix scroll hijacking issue during initial and return focus
- **Pressable**: Ensure consistent behavior between space and enter key

## Changed

- **Anatomy**: Update `createAnatomy` to return an array of the anatomy instance's part names

## Added

- New Avatar machine

## [0.9.2] - 2023-05-18

## Fixed

- **All machines**: Fix issue where event point calculation is incorrect when the page is scrolled
- **Dialog**: Fix issue where `setReturnFocus` used in `focus-trap` throws a console error
- **PinInput**: Fix issue where `defaultValue` is always overriden with an array with empty strings when mounted

## [0.9.0] - 2023-05-16

## Fixed

- **DatePicker**: Fix inconsistencies in api methods and naming conventions
- **Switch**: Remove unused attributes and make it consistent with checkbox
- **Tabs**
  - Remove unneeded style property in the indicator (depending on orientation)
  - Fix bug where keyboard navigation doesn't work in manual activation mode

## Changed

- **Anatomy**: Add support for renaming component scope/name

## [0.7.0] - 2023-05-03

## Fixed

- **All machines**: `Ensure ids of underlying elements can customized based on `ids` context property.
- **Editable**: Fix issue where focus is hijacked on blur when interacting outside on a focusable element
- **Core**: Refactor regex for `mergeProps` in zag core.
- **Solid.js**: Improve reactivity of `mergeProps` function
- **Carousel**: Improve support for spacing and slides per view
- **ColorPicker**: Export types for color channel and swatch parts
- **Popover, Menu, Tooltip, HoverCard**
  - Update the `setPositioning` api method to allow empty arguments
- **Slider, RangeSlider**: Ensure consistent props for marker
- **Splitter**: Export types for panel and resize trigger props

## Changed

- **Editable**: Add `finalFocusEl` to allow for better return focus management
- **Pagination**: Add `type` property to the pagination's context to control properties used in trigger element

## [0.6.0] - 2023-04-15

### Fixed

- **Vue**: Fix issue where `defaultValue` does not get applied to input element
- **Checkbox**: Fix issue where checkbox `toggleChecked` was not defined
- **DatePicker**
  - Fix issue where `focusedValue` was not synced with `value` property
  - Fix issue where input value was not updated when `locale` and `value` changed
- **RatingGroup, Splitter**
  - Update point calculations based on changes in `getRelativePointPercent` output

### Changed

- Rename **HoverCard** and **Popover** `onOpenChange` to `onOpen` and `onClose`

### Added

- New ColorPicker machine

## [0.5.0] - 2023-04-11

### Fixed

### Changed

- **All machines**: Ensure all packages are versioned together
- **Checkbox**: Remove the `defaultChecked` property in favor of the `checked` property that can now be controlled.

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

- **Dialog**: Remove the `defaultOpen` property in favor of the `open` property that can now be controlled.

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

- **HoverCard**: Remove the `defaultOpen` property in favor of the `open` property that can now be controlled.

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

- **Popover**: Remove the `defaultOpen` property in favor of the `open` property that can now be controlled.

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

- **Switch**: Remove the `defaultChecked` property in favor of the `checked` property that can now be controlled.

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

- **Tooltip**: Remove `defaultOpen` property in favor of the `open` property that can now be controlled.

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
