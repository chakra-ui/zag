# CHANGELOG

All notable changes to this project will be documented in this file.

> For v0.x changelog, see the [v0 branch](https://github.com/chakra-ui/zag/blob/v0/CHANGELOG.md)

## [1.11.0](./#1.11.0) - 2025-04-20

### Added

- **ListCollection**: Add support for grouping collection items

### Fixed

- **Listbox**: Export missing `SelectionMode` interface

## [1.10.0](./#1.10.0) - 2025-04-15

### Added

- **Toggle Group**: Add support for `deselectable` prop to ensure one or more toggle is selected at any time.

- **Splitter**:

  - Expose `api.resetSizes()` to reset the size to the initial specified size
  - Fix issue in vertical orientation where arrow up doesn't work as expected.

### Fixed

- **Select**: Fix issue where machine doesn't leave focus state when interacting outside with another editable element.
  This leads to the `data-focus` attribute not being removed from the trigger element.

- **Floating Panel**: Fix issue where clicking the trigger when panel is open, doesn't close the panel

## [1.9.3](./#1.9.3) - 2025-04-10

### Fixed

- **Floating Panel**

  - Change default strategy from `absolute` to `fixed` to improve positioning consistency
  - Implement controlled open/close state
  - Constraint the mouse movement to the boundary rect to prevent content from being moved outside completely

## [1.9.2](./#1.9.2) - 2025-04-10

### Fixed

- **Floating Panel**: Fix issue where `StageTriggerProps` and `AnchorPositionDetails` was not exported

## [1.9.1](./#1.9.1) - 2025-04-10

### Changed

- **Floating Panel**

  - Update props and APIs to be consistent with other components
  - Fix issue where position and size were not synchronized correctly

## [1.9.0](./#1.9.0) - 2025-04-09

### Added

- **Toast**: Add support for queuing toasts that exceed the maximum limit. When the maximum number of toasts is reached:

  - New toasts are added to a queue instead of being dropped
  - Queued toasts are automatically displayed when space becomes available
  - Queue is cleared when all toasts are removed

- **Listbox**

  - Add support for clearing selection on Escape press
  - Add `api.clearHighlightedValue` function to clear the highlighted value
  - Add `data-empty` attribute to indicate when the listbox is empty

- **Collection**: Add `filter` function to collection methods

### Fixed

- **Listbox**: Fix keyboard navigation when no item is highlighted
- **Combobox**: Fallback to trigger element as the positioning anchor

### Changed

- **Combobox**: Add `data-empty` attribute to the listbox and content to indicate when the listbox is empty

## [1.8.2](./#1.8.2) - 2025-04-04

### Fixed

- **Tabs, Radio Group**: Fix Next.js issue where indicator size might not be mentioned when conditionally rendering the
  component and `defaultValue` is set.

## [1.8.1](./#1.8.1) - 2025-04-04

### Fixed

- **Listbox**

  - Fix issue where keyboard focus loops when `loopFocus` was not set.
  - Fix issue where `extended` selection mode was not working as expected.

- **Dom Query**: Improve platform detection logic to detect `macOS` and `iOS` correctly.

## [1.8.0](./#1.8.0) - 2025-04-04

### Added

- **[New] Listbox**: Add listbox machine for displaying a list of selectable options, supporting both single and
  multiple selection modes.

### Changed

- **ListCollection**: Fix staleness issues in mutation methods by returning a new `ListCollection` instead of mutating
  the internal `items`

### Fixed

- **Tabs**: Fix issue where tabs indicator animation behaves inconsistently.

- **Date Picker**

  - Fix issue where datepicker throws error when navigating month view.
  - Fix issue where range selection doesn't reset correctly when clicking the same start date.

- **Interact Outside**

  - Fix issue where pointerdown outside doesn't work consistently on mobile devices.
  - Improve pointerdown outside click detection in shadow DOM environments.

## [1.7.0](./#1.7.0) - 2025-03-28

### Added

- **Slider**

  - Add support for `origin: end` to align the thumb to the end of the track.
  - Expose `thumbSize` as CSS variables in the root element. Can be useful for styling the slider.

- **Menu**: Fix issue where `addItemListener` doesn't work as expected.

### Fixed

- **Slider**: Fix issue where `thumbSize` CSS variable is not applied.

## [1.6.2](./#1.6.2) - 2025-03-27

### Fixed

- **Frameworks**: Ensure machine has started before processing events.
- **Menu**: Add `addItemListener` function to allow listening for dispatched custom event on menu item.

## [1.6.1](./#1.6.1) - 2025-03-26

### Fixed

- **HoverCard, ColorPicker**: Add missing `tabIndex` to improve usage within dialogs
- **Menu**
  - Fix issue where menu items don't have a unique id leading to accessibility and HTML validation issues
  - Dispatch `menu:select` event on the menu item when it is selected

## [1.6.0](./#1.6.0) - 2025-03-24

### Added

- **Collapsible**: Add collapsible indicator part

### Fixed

- **Splitter**: Fix issue where `onResizeStart` and `onResizeEnd` callbacks are not called when using keyboard

- **Combobox**: Fix issue where `onOpenChange` with the same `open` value

### Changed

- **Color Utils**: Export `ColorStringFormat` type

## [1.5.0](./#1.5.0) - 2025-03-20

### Fixed

- **File Utils**: Fix issue in `downloadFile` where `name` is not considered in some cases

### Changed

- **Number Input**: Set the default step to `0.01` when `formatOptions.style` is set to `percent`

- **[Breaking] Splitter**: Redesign splitter machine to support more use cases and improve DX.

  Before:

  ```ts
  const service = useMachine(splitter.machine, {
    id: useId(),
    defaultSize: [
      { id: "a", size: 50 },
      { id: "b", size: 50 },
    ],
  })
  ```

  After:

  ```ts
  const service = useMachine(splitter.machine, {
    id: useId(),
    panels: [{ id: "a" }, { id: "b" }],
    defaultSize: [50, 50],
  })
  ```

  The also comes with new features such as:

  - Support for collapsible panels
  - Support for collapse and expand events
  - Methods for resizing the panels programmatically

## [1.4.2](./#1.4.2) - 2025-03-18

### Fixed

- **Toast**: Fix issue where setting `offsets` to `undefined` causes machine to throw

- **Select**: Fix issue where select `valueAsString` loses reactivity

## [1.4.1](./#1.4.1) - 2025-03-17

### Fixed

- **Slider**: Fix issue where value normalization doesn't work as expected

## [1.4.0](./#1.4.0) - 2025-03-14

### Added

- **Splitter**
  - Add `api.setSizes` to set the size of multiple panels
  - Add `api.getSize` to get the size of a panel

### Fixed

- **Number Input**: Fix issue where number input `onValueChange` is called with incorrect `valueAsNumber`

- **Slider**: Fix issue where setting `min` to value other than `0` causes incorrect initial placement of thumbs

## [1.3.3](./#1.3.3) - 2025-03-10

### Fixed

- **Combobox**: Fix issue where cursor moves unexpected when editing input value

- **Tags Input**: Improve caret detection logic to prevent unwanted tag removal

- **Timer**

  - Fix issue where timer slows down when switching tabs/windows
  - Change default `interval` value from `250` to `1000`

## [1.3.2](./#1.3.2) - 2025-03-08

### Fixed

- **Pin Input**: Fix issue where OTP SMS autofill doesn't work as expected.

- **Date Picker**: Fix issue where Svelte throws a `state_unsafe_mutation` error when controlling the datepicker range
  mode.

- **Rating Group**: Fix issue where rating group label places focus incorrectly.

- **React**: Flush effects synchronously rather than within a microtask.

- **Checkbox**: Fix issue where checkbox incorrectly sets `data-invalid` when `invalid` is `false`.

## [1.3.1](./#1.3.1) - 2025-03-05

### Fixed

- **Radio Group, Switch**: Improve focus behavior in Safari browser.

- **Accordion**: Fix issue in Safari where clicking triggers doesn't show the content as expected.

- **Auto Resize**:
  - Fix issue where height calculations could be incorrect in high DPI scenarios.
  - Account for `maxHeight`, `overflowY`, and `boxSizing` CSS properties.
  - Calculate height when its form owner resets.

## [1.3.0](./#1.3.0) - 2025-03-03

### Fixed

- **General**: Fix issue where machines that hold complex objects could cause issues.

### Added

- **Date Picker**:

  - Add support for `api.getViewProps`.
  - Add `visibleRangeText` property to `api.offset()` return value.

- **Progress**: Add support for `locale` and `formatOptions` to properly format the `api.percentAsString` result.

- **Framework Adapters (React, Svelte, Solid, Vue)**: Support `reenter:true` in machine transitions.

## [1.2.1](./#1.2.1) - 2025-02-27

### Fixed

- **Progress**: Allow for more precise (decimal) values.

- **Scroll Snap**: Fix issue where `getScrollPadding` could return `NaN` in test environments.

- **Date Picker**: Fix issue where `onValueChange` doesn't get called when value is cleared.

- **Number Input**: Fix issue where `allowOverflow` was not implemented.

## [1.2.0](./#1.2.0) - 2025-02-26

### Fixed

- **Signature Pad**

  - Fix issue where hidden input throws a controlled warning in React due to the absence of `readOnly` or `onChange`.
  - Fix issue where calling `getDataUrl` in the `onDrawEnd` callback after clearing the signature pad does not return an
    empty string.

- **React**: Improve Hot Module Replacement such that effects are replayed correctly. This removes the need to refresh
  the page for changes to take effect.

- **Toggle Group**: Fix issue where calling `api.setValue` with an array doesn't work as expected.

- **Pin Input**: Fix `flushSync was called from inside a lifecycle method` warning.

- **Vue**: Fix issue where `choose is not a function` error could be thrown for some machines.

- **File Upload**: Fix issue where `win.DataTransfer` could throw in testing environments.

- **Time Picker**: Fix `[@zag-js/dismissable] node is null or undefined` warning when lazy mounting the content.

### Added

- **Pin Input**: Add support for `count` prop to improve SSR `aria-label` attribute.

## [1.1.0](./#1.1.0) - 2025-02-26

### Fixed

- **Pin Input**: Fix issue where editing existing values don't work as expected.

- **Number Input**: Fix issue where `value` prop wasn't consumed in the machine.

- **Carousel**: Fix issue where `page` was not consumed in the machine.

- **Textarea**: Fix issue where `ResizeObserver` loop could throw undelivered notifications warning.

### Added

- **Toggle**: Bring back toggle machine.

- **Hover Card**: Expose interaction outside handlers to hover card.

## [1.0.2](./#1.0.2) - 2025-02-24

### Fixed

- **Collection**: Widen `items` type to allow `Iterable` instead of just `Array` since we internally convert iterables
  to an array.

- **Carousel**: Enforce required `slideCount` to ensure machine works as expected.

- **Framework Bindings**: Fix issue where `undefined` values were not filtered out before resolving props.

- **React**: Fix issue where `flushSync` warnings could be shown when unmounting a component.

## [1.0.1](./#1.0.1) - 2025-02-23

### Fixed

- **Select**: Fix regression where `multiple: true` doesn't work.

- **Timer**: Fix issue where timer doesn't restart when `startMs` changes.

- **Toggle Group**: Fix issue where `data-focus` doesn't get removed after blurring the toggle group.

- **Toast**: Fix keyboard navigation issue where toast group skips the close button within the toast item and moves to
  the next focusable element in the document.

### Added

- Added `<component>.Machine` type to help when typecasting generic components like combobox and select.

## [1.0.0](./#1.0.0) - 2025-02-22

### Changed

- **Core**: Rewrite machines for increased performance and initial mount time. The results show roughly 1.5x - 4x
  performance improvements across components.

- **[Breaking] Toast**

  - Require the creation of a toast store using `createStore`
  - **Solid.js**: Require the usage of `<Key>` component to render toasts

### Fixed

- **Menu**: Fix issue where context menu doesn't update positioning on subsequent right clicks.

- **Avatar**: Fix issue where `api.setSrc` doesn't work.

- **File Upload**: Fix issue where drag-and-drop doesn't work when `directory` is `true`.

- **Carousel**

  - Fix issue where initial page is not working.
  - Fix issue where pagination sync broken after using dots indicators.

- **Timer**: Fix issue where timer stops when switching tabs.
