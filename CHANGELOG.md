# CHANGELOG

All notable changes to this project will be documented in this file.

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

## [0.33.0](./#0.33.0) - 2024-01-23

### Fixed

- **All Machines**:
  - Improve runtime performance by only creating a machine instance once, and updating the context with
    `setContext(...)` instead of `withContext(...)`.
  - Fix issue on touch devices where selecting an item within combobox, menu, select triggers click event on element
    behind the portalled content.

**PinInput**: Fix an issue where paste in pin input would fill the input with all pasted characters instead of 1 per
input

### Added

- **TreeView**: Add new `TreeView` component to render a tree view of items. This component is useful for rendering
  nested data structures like a file system.

  > This component is still in beta and is subject to change.

### Changed

- **TagsInput**:Improve `TagsInput` component design by introducing a new `item-preview` part. See the diff below for
  more details.

```diff
<div {...api.rootProps}>
  {api.value.map((value, index) => (
-    <span key={index}>
+    <span key={index} {...api.getItemProps({ index, value })}>
-     <div {...api.getItemProps({ index, value })}>
+     <div {...api.getItemPreviewProps({ index, value })}>
        <span>{value} </span>
        <button {...api.getItemDeleteTriggerProps({ index, value })}>&#x2715;</button>
      </div>
      <input {...api.getItemInputProps({ index, value })} />
    </span>
  ))}
  <input placeholder="Add tag..." {...api.inputProps} />
</div>
```

- **Progress**: Rename indicator part to view to better communicate the purpose of the part.

## [0.32.1](./#0.32.1) - 2024-01-10

### Fixed

- **ColorPicker**: Fix issue where some change details typings were no exported
- **Combobox**:
  - Fix an issue that breaks the combobox when clicking on the input while the menu is open
  - Fix issue where some change details typings were no exported

## [0.31.1](./#0.31.1) - 2023-12-01

### Fixed

- **NumberInput**: Fix issue where formatting on blur doesn't work as expected

## [0.31.0](./#0.31.0) - 2023-11-27

### Fixed

- **ColorPicker**: Fix issue where swatch indicator had incorrect data attributes

- **NumberInput**:

  - Fix issue when value updates due to intl formatting does not trigger `onValueChange`
  - Fix issue where increment and decrement buttons doesn't respect locales (esp. when locales uses decimal commas and
    not decimal points)

- **Menu**: Fix issue in non-portalled, nested menus where keyboard interactions within submenu bubble to parent menu

### Added

- **FileUpload**
  - Add support for `onFileAccept` and `onFileReject` callbacks.
  - Add support customizing `ids` and aria labels using `messages` context property.
  - Add item preview image part
  - **Breaking**: Update file error types
    - `TOO_MANY_FILES_REJECTION` > `TOO_MANY_FILES`
    - `TOO_LARGE` > `FILE_TOO_LARGE`
    - `TOO_SMALL` > `FILE_TOO_SMALL`

### Changed

- **DatePicker**: Rename `messages` context property to `translations`. This property was previously unused

## [0.30.0](./#0.30.0) - 2023-11-14

### Fixed

- **RadioGroup**: Fix issue where indicator isn't positioned relative to the root

### Added

- **ColorPicker**:

  - Add support for setting the desired output format. This format will be used in the `details.valueAsString` for
    `onValueChange` callback
  - Add support for format trigger and select parts to help control the format of the output value
  - Add `onFormatChange` callback to listen for format changes
  - Add `closeOnSelect` prop to control whether the color picker should close when a swatch color is selected

- **Toast**: Add generic support to toast types to support framework-specific types.

## [0.28.1](./#0.28.1) - 2023-11-09

### Fixed

- **Dialog**: Fix issue where dialog positioner applied the `hidden` attribute when closed leading to pre-mature exit of
  css animations applied to the dialog content.

  > Only the backdrop and content should use the `hidden` attribute.

- **Combobox**: Fix a case where item highlight was looping even though loop property was false

## [0.28.0](./#0.28.0) - 2023-11-08

### Fixed

- **Menu**: Fix issue issue where link is not clickable on mobile
- **Accordion**: Fix issue where `onValueChange` is not called when `multiple` is set to `true`
- **NumberInput**
  - Fix issue where "." cannot be entered due to virtual dom timing between frameworks
  - Fix issue where decrement and increment triggers don't work for touch devices
- **ColorPicker, DatePicker**: Fix issue where `aria-controls` was not added to trigger
- **Combobox**: Fix autocomplete input behavior not working in Vue.js
- **Select**: Fix issue where the `loop` property is not respected
- **Slider**: Fix issue where slider thumb throws if index is not provided. We now set `0` as the default index.

### Added

- **Menu**: Add support for controlling menu's open state via the `open` context property

## [0.27.0](./#0.27.0) - 2023-10-30

### Fixed

- **ColorPicker**:
  - Fix issue where entering empty value in alpha sets value to `NaN`. Now, it reverts back to the previous alpha value
  - Fix issue where channel inputs within control and content have similar ids, violating the accessibility tree
- **Select**: Fix issue where `collection` is not returned in the `api`
- **React**: Refactor types to reference react `use` directly
- **DatePicker**: Fix issue where `api.isOpen` returned `undefined` in some cases

### Added

- **RadioGroup**: Set default orientation to `vertical`

### Changed

- **Slider**: Rename `output` part to `valueText` to match naming convention
- **DatePicker**
  - Remove support for `inline` in datepicker and replace with `closeOnSelect` for API consistency.
  - Add `data-placement` to trigger and content parts for position-aware styling.

## [0.25.0](./#0.25.0) - 2023-10-17

### Fixed

- **ColorPicker**

  - Fix issue where channel inputs within control doesn't get synced
  - Fix issue where area selection doesn't work when the value is not `hsl`
  - Add default `12px` size for transparency grid

- **RadioGroup**: Fix issue where indicator stays visibile when the value is `null`

- **Combobox**: Fix issue where combobox positioner is `hidden` when combobox is not open

### Changed

- **Toast**: Redesign toast render apis to allow for framework control.

  - `defaultOptions` can now be passed directly to the `toast.group` machine context.
  - You can now pass the default `render` function to the `toast.group` machine context.
  - Removed `api.render` in favor of userland control. This eliminates the bug in Solid.js for custom toasts.

- **Carousel**: Rename `onSlideChange` to `onIndexChange`

- **Slider, RangeSlider**: Merge the slider and range slider machines into one to prevent logic duplication.

  - `value` and `onValueChange` type has been updated to be `number[]`
  - Update `api.getThumbProps(index)` to `api.getThumbProps({ index })`

- **Dialog**: Rename dialog container to dialog positioner for better API consistency. This means `api.containerProps`
  is now `api.positionerProps`

## [0.24.0](./#0.24.0) - 2023-10-12

### Fixed

- **FileUpload**: Issue where `api.setFiles` and `api.clearFiles` does not work
- **NumberInput**: Fix issue where before input gets called with incorrect event data
- **Popover**: Fix issue where popover shows a `DOMException` warning when third party iframes are present

### Added

- **DatePickcer**: Add new table head component to allow for customizing the table head

### Changed

> 💥 Breaking changes

- **Combobox, Select, HoverCard**: Rename `api.setPositioning(...)` to `api.reposition(...)`

- **Carousel**: Refactor components to ensure consistent naming convention

  - `slideGroupProps` -> `itemGroupProps`
  - `getSlideProps` -> `getItemProps`
  - `nextSlideTrigger` -> `nextTrigger`
  - `prevSlideTrigger` -> `prevTrigger`

- **ColorPicker**:

  - Redesigned components to ensure consistent naming convention
  - Added support for trigger and content parts to control the open/close behavior
  - Add new `api.getChannelValue` API to get the value of a specific color channel

- **Pagination**: Rename component anatomy and parts

  - `getPageTriggerProps` => `getTriggerProps`
  - `getNextPageTriggerProps` => `getNextTriggerProps`
  - `getPrevPageTriggerProps` => `getPrevTriggerProps`

## [0.23.0](./#0.23.0) - 2023-10-02

### Fixed

- **All Machines**: Ensure `dir` is applied to all positioner elements
- **FileUpload**: Fix reopening the system file picker in file-upload on browsers other than Chrome
- **PinInput**: Fix issue where multiple values can be entered in a single input

### Changed

> 💥 Breaking changes

- **FileUpload**:

  - Redesign the file-upload component to include new parts:
    - `Item`: The element that represents a file
    - `ItemSizeText`: The element that represents the size of a file
    - `ItemName`: The element that represents the name of a file
    - `ItemDeleteTrigger`: The buttonelement used to delete a file
  - Added new `api.getFileSize` method to get the size of a file in a human readable format

- **RatingGroup**:
  - Rename `api.sizeArray` to `api.items`
  - Rename `max` to `count`

## [0.22.0](./#0.22.0) - 2023-09-26

### Fixed

- **All machines**: Ensure the `dir` attribute is applied consistently across all component parts.
- **ColorPicker**:
  - Fix issue where color area changes format when you type custom hex values
  - Fix issue where alpha channel input resets to 1 after blurring hex channel input
- **Dialog**:
  - Fix issue where focusing outside closes the dialog despite `closeOnInteractOutside` being set to `false`
- **Editable**:
  - Fix issue where the input value doesn't get synced correctly when controlled

### Added

- **Combobox**: Add support for `api.setPositioning(...)` to allow for repositioning the combobox content
- **Menu**:
  - Add new `optionItemIndicator` and `optionItemText` part
  - Add `api.optionItemIndicatorProps(...)`, `api.optionItemTextProps(...)` support
  - Add api.getOptionItemState and `api.getItemState`
  - Export `OptionItemState` and `ItemState` types
- **ColorPicker**: Add support for entering native color names (e.g. red, blue, green, etc.)

### Changed

- **Menu**:
  - Removed `api.isOptionChecked` in favor of `api.getOptionItemState`
- **NumberInput**:
  - Refactor number input machine to handle number parsing correctly
  - Fix issue where value doesn't listen to form reset events
  - **BREAKING:** Removed the following context properties in favor of the new `formatOptions`: `validateCharacter`,
    `parse`, `format`, `minFractionDigits`, `maxFractionDigits`
- **Dialog**:
  - Fix issue where `modal: false` doesn't disable focus trap
  - Rename `closeOnEsc` to `closeOnEscapeKeyDown`
  - Rename `onEsc` to `onEscapeKeyDown`
  - Rename `closeOnOutsideClick` to `closeOnInteractOutside`
- **Editable**:
  - Hide submit and cancel trigger when not in editing mode
  - Hide edit trigger when in editing mode

## [0.21.0](./#0.21.0) - 2023-09-19

### Fixed

- **ToggleGroup**: Fix issue where anatomy was not exported
- **Pagination**: Fix bug where pagination returns inconsistent pages
- **Select, Combobox**: Fix issue where `readonly` items could not be used in the collection
- **Focus Visible**: Fix issue where focus visible was not working when clicked inside element with `tabindex` attribute
- **Toast**: Fix accessibility issue where toast placement region labels were not unique
- **Menu**: Fix issue where menu does not scroll highlighted item into view

### Added

- Add indicator part to some components for ease of styling. Added `AccordionItemIndicator`, `SelectIndicator`,
  `MenuIndicator`, `PopoverIndicator`

### Changed

- **Popper**: Ensure positioner uses the same `zIndex` as the content element

> 💥 Breaking changes

- Refactor component anatomy to use consistent naming convention across all machines.

  - **Accordion**

    - `getTriggerProps` => `getItemTriggerProps`
    - `getContentProps` => `getItemContentProps`

  - **Radio**

    - `getRadioProps` => `getItemProps`
    - `getRadioControlProps` => `getItemControlProps`
    - `getRadioLabelProps` => `getItemTextProps`
    - `getRadioHiddenInputProps` => `getItemHiddenInputProps`
    - `getRatingState` => `getItemState`
    - `getRatingProps` => `getItemProps`

  - **TagsInput**

    - `getTagProps` => `getItemProps`
    - `getTagDeleteTriggerProps` => `getItemDeleteTriggerProps`
    - `getTagInputProps` => `getItemInputProps`

  - **Toggle Group**
    - `getToggleProps` => `getItemProps`

- **ToggleGroup**: Allow deselecting item when `multiple` is `false`.

## [0.20.0](./#0.20.0) - 2023-09-14

### Fixed

- **Pagination**: Fix issue where change callback does not get called when clicking the page button.

### Added

- **DatePicker**: Add `onOpenChange` callback to listen for changes in the open state
- **[New]**: Add `@zag-js/file-utils` package to help with file related operations
- **Editable**: Autofocus the editable input element when `startsWithEditView` is set to `true`
- **Tabs**: Add `api.getTriggerState(...)` to get the current state of the tab trigger

### Changed

> 💥 Breaking changes

- **All machines**: Unify all callbacks to follow a consistent naming convention

  - `onOpen` and `onClose` => `onOpenChange`
  - `onChange` => `onValueChange`
  - `onFocus` => `onFocusChange`
  - `onHighlight` => `onHighlightChange`
  - `onLoad` and `onError` => `onLoadingStatusChange`
  - `onInputChange` => `onInputValueChange`

- Remove toggle machine in favor of userland implementation. For more advanced toggle functionality, use the
  `ToggleGroup` machine.

- **RadioGroup**: Remove `api.blur()` from radio group machine. Prefer to use `document.activeElement.blur()` instead.

- **FileUpload**

  - Rename `api.setValue` to `api.setFiles`
  - Rename `api.clearValue` to `api.clearFiles`

- **Tabs**: Changed `api.setIndicatorRect(id)` to `api.setIndicatorRect(value)` for better userland control

## [0.19.1](./#0.19.1) - 2023-09-11

### Fixed

- **All machines**: Fix issue where onChange callbacks could be executed excessively when no value changed.
- **Combobox, Select**:
  - Fix issue where clear trigger was incorrectly shown when value is empty
  - Export `CollectionItem` type
  - Ensure consistent usage of generics across the `connect` and `machine` functions

## [0.19.0](./#0.19.0) - 2023-09-07

### Fixed

- **Popper**: Fix issue where passing the `offset` positioning option to popper-related components causes undesired
  placement in each render cycle.

- **RadioGroup**: Fix issue where change event doesn't get dispatched when value changes programmatically.

### Added

- **Combobox, Selected**
  - Add `control` and `root` parts to select and combobox components

### Changed

- **Combobox, Select**

  - Loosen the collection item types to allow string item
  - Add generic to select and combobox context and api
  - Use dismissable layer to better manage layering when used in a popover or dialog

- **Checkbox, Switch**: Dispatch change event when checked state is set programmatically to get it working in Solid.js
  form libraries

## [0.18.0](./#0.18.0) - 2023-09-05

### Fixed

- **DatePicker**
  - Fix issue where datepicker value `onChange` returned a proxy array
  - Fix issue where clearing the date picker value prevent selecting a new date when `inline: true` is set
- **Menu**: Fix issue where `closeOnSelect` on menu item props isn't respected in machine
- **NumberInput**: Fix issue where number input goes into infinite update cycles due to additional input event

### Added

- **React**: Export `PropTypes` from react package for consistency
- **Select, Combobox**: Add support for selecting multiple items
- **Combobox**: Add support for `closeOnSelect`

### Changed

- **RadioGroup**: Remove unsupported `readOnly` property from types

> 💥 Breaking changes

Redesign select and combobox API to allow passing value as `string` and `collection`

Prior to this change, Zag computes the label and value from the DOM element. While this worked, it makes it challenging
to manage complex objects that don't match the `label` and `value` convention.

```jsx
// Create the collection
const collection = select.collection({
  items: [],
  itemToString(item) {
    return item.label
  },
  itemToValue(item) {
    return item.value
  },
})

// Pass the collection to the select machine
const [state, send] = useMachine(
  select.machine({
    collection,
    id: useId(),
  }),
)
```

## [0.17.0](./#0.17.0) - 2023-08-26

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

## [0.16.0](./#0.16.0) - 2023-08-13

## Fixed

- **Select**: Fix issue where interaction outside and positioning does not work when select content is conditionally
  rendered

## Changed

- **Pressable**: Remove `id` usage for better composition
- **Radio**: Rename `getRadioInputProps` to `getRadioHiddenInputProps`
- **Tabs**: Rename `tablist` part to `list` to match naming convention

## [0.15.0](./#0.15.0) - 2023-08-08

## Changed

- **Checkbox**: Rename `inputProps` to `hiddenInputProps`
- **All machines**: Remove `hiddenInput` from machine anatomy
- **Combobox**: Add `optionGroupLabel` part to **Combobox**
- **Tabs**: Remove content group part

## [0.14.0](./#0.14.0) - 2023-08-07

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

## [0.13.0](./#0.13.0) - 2023-07-25

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

## [0.12.0](./#0.12.0) - 2023-07-16

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

## [0.11.2](./#0.11.2) - 2023-07-13

## Fixed

- **All machines**: Fix issue where machine types were not being properly inferred

## [0.11.1](./#0.11.1) - 2023-07-12

## Fixed

- **Carousel**: Expose the types and add `onClick` to carousel indicator
- **ColorPicker**: Fix types exports

## [0.11.0](./#0.11.0) - 2023-07-11

## Fixed

- **Editable**: Fix issue where initially cancelling the value by pressing the escape key doesn't work
- **Tooltip**: Fix issue where it re-opens after clicking the trigger and moving the cursor slightly

## Changed

- **Tooling**: Revert build tooling from `vite` to `tsup`

## Added

- New presense machine to manage mount/unmount animation.

## [0.10.5](./#0.10.5) - 2023-07-06

## Fixed

- **All machines**: Fix an issue where type declarations aren't inferred correctly

## [0.10.4](./#0.10.4) - 2023-07-05

## Fixed

- **RadioGroup**: Fix issue where indicator part does not transition its size and position after first render

## [0.10.3](./#0.10.3) - 2023-06-30

## Fixed

- **All machines**: Improve DOM detection code to rely on `document` instead of `window`
- **Popper**: Fix issue where `offset` is ignored from default gutter

## [0.10.2](./#0.10.2) - 2023-06-01

## Fixed

- **Avatar**: Fix issue where anatomy was not exported
- **Splitter**: Set the panel's default `minSize` to `0`

## [0.10.1](./#0.10.1) - 2023-05-31

## Fixed

- **Splitter**: Fix issue where `api` for controlling panel sizes wasn't implemented

## [0.10.0](./#0.10.0) - 2023-05-31

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

## [0.9.2](./#0.9.2) - 2023-05-18

## Fixed

- **All machines**: Fix issue where event point calculation is incorrect when the page is scrolled
- **Dialog**: Fix issue where `setReturnFocus` used in `focus-trap` throws a console error
- **PinInput**: Fix issue where `defaultValue` is always overriden with an array with empty strings when mounted

## [0.9.0](./#0.9.0) - 2023-05-16

## Fixed

- **DatePicker**: Fix inconsistencies in api methods and naming conventions
- **Switch**: Remove unused attributes and make it consistent with checkbox
- **Tabs**
  - Remove unneeded style property in the indicator (depending on orientation)
  - Fix bug where keyboard navigation doesn't work in manual activation mode

## Changed

- **Anatomy**: Add support for renaming component scope/name

## [0.7.0](./#0.7.0) - 2023-05-03

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

## [0.6.0](./#0.6.0) - 2023-04-15

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
