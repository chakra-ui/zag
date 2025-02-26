# CHANGELOG

All notable changes to this project will be documented in this file.

> For v0.x changelog, see the [v0 branch](https://github.com/chakra-ui/zag/blob/v0/CHANGELOG.md)

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

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
