# CHANGELOG

All notable changes to this project will be documented in this file.

> For v0.x changelog, see the [v0 branch](https://github.com/chakra-ui/zag/blob/v0/CHANGELOG.md)

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

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
