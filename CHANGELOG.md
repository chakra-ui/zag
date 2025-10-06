# CHANGELOG

All notable changes to this project will be documented in this file.

> For v0.x changelog, see the [v0 branch](https://github.com/chakra-ui/zag/blob/v0/CHANGELOG.md)

## [1.26.0](./#1.26.0) - 2025-10-06

### Added

- **Tree View**: [Experimental] Add support for renaming tree node labels with validation and control features.

  This feature enables users to edit tree node labels inline, unlocking use cases like file explorers, folder management
  systems, content hierarchies, and any tree-based interface where users need to rename items.

  **Key Features:**
  - Press `F2` on any node to enter rename mode
  - Input is automatically focused and synced with current label
  - Press `Enter` to submit or `Escape` to cancel
  - Blur event automatically submits changes
  - IME composition events are properly handled for international input

  **Validation & Control:**
  - `canRename` - Control which nodes are renameable based on node type or custom logic
  - `onRenameStart` - Called when rename mode starts (useful for analytics, showing hints)
  - `onBeforeRename` - Validate rename before accepting (e.g., prevent duplicates, empty names)
  - Empty name prevention - Automatically stays in rename mode if submitted name is empty/whitespace
  - Label trimming - Labels are automatically trimmed before being passed to callbacks
  - `onRenameComplete` - Handle the rename and update your collection

  **Styling & Visual State:**
  - `data-renaming` attribute - Added to both item and branch elements when in rename mode for easy styling
  - `nodeState.renaming` - Boolean property to check if a node is currently being renamed

### Fixed

- **Editable**: Fix issue where input value fails to revert after repeated full deletion

- **Focus Visible**: Fix `"Cannot assign to read only property 'focus'"` console error by gracefully handling
  environments where `HTMLElement.prototype.focus` is non-configurable.

- **Listbox**: Fix `splitProps` to avoid partial

- **Presence**: Fix race condition where dialog remains closed when `open` prop rapidly changes from `true` to `false`
  to `true`

- **Solid**: Fix issue where transition actions received stale event data

## [1.25.0](./#1.25.0) - 2025-09-28

### Added

- **Collapsible**: Add support for `collapsedHeight` and `collapsedWidth` props to control the dimensions of the
  collapsible content when in its collapsed state.

- **Focus Trap**: Allow elements referenced by `aria-controls` to be included in the trap scope. This makes it possible
  for menus, popovers, etc. to be portalled and work correctly.

- **Pagination**: Add `getPageUrl` prop for generating `href` attributes when using pagination as links.

```ts
const service = useMachine(pagination.machine, {
  type: "link",
  getPageUrl: ({ page, pageSize }) => `/products?page=${page}&size=${pageSize}`,
})
```

- **Slider**: Export `splitMarkerProps` helper.

### Fixed

- **Scroll Area**: Fix RTL horizontal scrollbar positioning on Safari

- **Slider**: Fix issue where slider continues dragging when disabled during drag operation.

- **Switch**: Fix issue where `data-active` is inconsistently applied when `disabled` state changes at runtime

## [1.24.2](./#1.24.2) - 2025-09-18

### Fixed

- **Date Picker**: Fix issue where year range picker doesn't show the hovered range

- **Date Utils**:
  - Fix issue where quarter presets returns incorrect date
  - Fix issue where year range picker doesn't show the hovered range

- **I18n Utils**:
  - **formatBytes**: Support `unitSystem` property to allow changing between decimal (1000 bytes) and binary (1024
    bytes) systems.

- **Number Input**: When `formatOptions` is used (like `style: "currency"`), the cursor would jump to the end of the
  input when typing in the middle. The cursor now maintains its relative position during formatting changes.

- **Pin Input**: Fix issue where using the keyboard shortcuts `Cmd+Backspace` and `Cmd+Delete` to delete text in pin
  inputs would insert "undefined" instead of clearing the field.

- **Scroll Area**: Fix issue where resize tracking was not observing the root element, which caused the scrollbar to not
  update when the root element's size changed.

## [1.24.1](./#1.24.1) - 2025-09-14

### Fixed

- **Core**: Fix issue where `mergeProps` throws when `props` is undefined or null

## [1.24.0](./#1.24.0) - 2025-09-13

### Added

- **Combobox**: Add `alwaysSubmitOnEnter` prop to allow bypassing the default two-step behavior (Enter to close
  combobox, then Enter to submit form) and instead submit the form immediately on Enter press. This is useful for
  single-field autocomplete forms where Enter should submit the form directly.

### Fixed

- **Editable**: Allow text selection in editable preview when `autoResize` is enabled

  Previously, when `autoResize` was set to `true`, the preview element had `userSelect: "none"` applied, preventing
  users from selecting text. This has been fixed by removing the `userSelect` style property.

- **File Upload**: Fix regression where clicking the trigger doesn't open the file picker when used within the dropzone

- **Hover Card**: Change default delay values for hover card to improve accessibility.
  - `openDelay`: from `700ms` to `600ms`

- **Menu**: Fix issue where keyboard activation of menu items with `target="_blank"` would open two tabs

- **Svelte**: Fix Svelte warning about state reference capturing initial value instead of current reactive state

- **Tooltip**: Change default delay values for tooltip to improve accessibility.
  [Learn more](https://www.nngroup.com/articles/timing-exposing-content)
  - `openDelay`: from `1000ms` to `400ms`
  - `closeDelay`: from `500ms` to `150ms`

## [1.23.0](./#1.23.0) - 2025-09-11

### Added

- **Dismissable**: Add support for layer types in dismissable layer stack. Layers can now be categorized as `dialog`,
  `popover`, `menu`, or `listbox`. This enables:
  - `data-nested` attribute on nested layers of the same type
  - `data-has-nested` attribute on parent layers with nested children of the same type
  - `--nested-layer-count` CSS variable indicating the number of nested layers of the same type

### Fixed

- **Core**: Fix issue where `mergeProps` strips symbols after merging

- **Dom Query**:
  - Fix issue where `isActiveElement` checks don't consider the Shadow DOM
  - Fix issue where `getActiveElement` returns `activeElement` rather than `null` for focusable web components with no
    focusable children

- **Menu**: Fix issue where hovering a partially visible item with pointer causes it to scroll into view

- **Tabs**: Fix issue where `ids` for `item` and `content` could not be customized

- **Toast**: Allow creating a toast store without any arguments

  ```tsx
  // before
  const store = toast.createStore({})

  // after
  const store = toast.createStore()
  ```

## [1.22.1](./#1.22.1) - 2025-08-27

### Fixed

- **Collection**: Fix issue where disabled items could be reached via typeahead

- **Date Picker**: Fix issue where datepicker doesn't revert to a valid value when the input value exceeds the min/max
  and blurred

- **Tags Input**: Fix issue where highlighted item doesn't clear when tabbing out of the input to an external button
  within the `control` part.

## [1.22.0](./#1.22.0) - 2025-08-26

### Added

- **Hover Card**: Add support for `disabled` prop

### Fixed

- **Color Picker**: Fix issue where color picker was not working correctly in RTL mode

- **Dismissable**: Expose `onRequestDismiss` custom event handler for event a parent layer requests the child layer to
  dismiss. If prevented via `event.preventDefault()`, the child layer will not dismiss when the parent layer is
  dismissed.

- **Number Input**
  - Omit the input `pattern` when `formatOptions` is provided. This prevents native pattern validation from conflicting
    with formatted values (e.g., currency or percent).
  - Handle empty values consistently across all format options.
  - Add `data-scrubbing` attribute to the number input parts.

- **Tooltip**
  - Set `closeOnPointerdown` to `false` when `closeOnClick` is set to `false`
  - Reduce bundle size by replacing `@zag-js/store` dependency with a lightweight store implementation.

## [1.21.9](./#1.21.9) - 2025-08-23

## Fixed

- **Async List**:
  - Fixed critical race conditions and dual operations in sort functionality that could cause stale data overwrites and
    unexpected behavior
  - Fixed event handling during async operations - users can now properly interrupt sorting with RELOAD, FILTER, or new
    SORT events
  - Enhanced `SortDetails` interface with `filterText` parameter for consistent filtering context across local and
    server-side operations

## [1.21.8](./#1.21.8) - 2025-08-22

### Fixed

- **Date Picker**:
  - Clear hovered range state after completing range selection instead of waiting for pointer to leave the calendar
    area.
  - Fix issue where month and year select labels don't update correctly when using `min`/`max` constraints.
  - Expose `disabled` on `api.getMonths()` and `api.getYears()` results to indicate options out of range for current
    constraints.

- **Listbox**:
  - Fix issue where first enabled item should be highlighted by default when listbox receives focus and no item is
    currently highlighted.
  - Add `getElement` to `scrollToIndexFn` details
  - Track collection changes and clear `highlightedValue` if the item is no longer in the collection.

- **Scroll Area**:
  - Avoid detecting hover state from portalled descendants.
  - Add `data-dragging` attribute to scroll area parts.

- **Select**: Add `getElement` to `scrollToIndexFn` details

- **Combobox**: Add `getElement` to `scrollToIndexFn` details

## [1.21.7](./#1.21.7) - 2025-08-19

### Added

- **Highlight Word**: Add `exactMatch` option that enables whole-word matching using regex word boundaries.

### Fixed

- **Menu**: Fix context menu repositioning logic

- **Scroll Area**: Add `data-hover` to scroll area

## [1.21.6](./#1.21.6) - 2025-08-17

### Fixed

- **Menu**: Fix context menu positioning bug where reopening at the same coordinates fails to reposition

- **Scroll Area**: Rename `data-hovering` to `data-hover` for consistency

## [1.21.5](./#1.21.5) - 2025-08-16

### Fixed

- **Scroll Area**:
  - Fix issue where scroll area thumb applies width/height incorrectly
  - Add `data-overflow-*` to content and corner
  - Add custom easing function support for smooth scrolling

## [1.21.4](./#1.21.4) - 2025-08-16

### Fixed

- **Scroll Area**: Ensure types are exported and fix incorrect `@zag-js/dom-query/src/query` import

- **ListCollection**
  - Avoid recomputing groups on every call to `at()` and `indexOf()`
  - Fixed bug in `find()` method (was checking `!= null` instead of `!== -1`)

- **GridCollection**: Avoid recomputing rows on every call to `getRows()`

- **Menu**: Add `data-state` attribute for context menu trigger

## [1.21.3](./#1.21.3) - 2025-08-14

### Fixed

- **Listbox**: Add support for navigating grid collections

### Changed

- **Async List**: Improve type inference for descriptors

- **Framework Components**: Improve runtime performance of components by removing refs/events from stateful to
  non-stateful objects (affects Svelte, Solid, and Vue components)

## [1.21.2](./#1.21.2) - 2025-08-13

### Added

- **Scroll Area**: Initial release of scroll area state machine

### Fixed

- **Carousel**:
  - Fix an issue where the carousel would not update when `slideCount` or `autoplay` props change.
  - Fix an issue where `loop: false` was ignored when using autoplay. Now, the carousel will stop when it gets to the
    last slide.

- **Date Picker**: Expose `data-inline` attribute on Content part to enable distinct styling for inline date pickers
  versus popover date pickers.

- **Menu**: Fix issue where `onCheckedChange` could be called twice on checkbox or radio item

- **Radio Group**: Fixed issue where arrow key navigation doesn't apply `data-focus-visible` on the newly focused item.

## [1.21.1](./#1.21.1) - 2025-07-31

### Fixed

- **Carousel**: Fix issue where controlled carousel ignores last slide

- **Tour**: Re-expose `WaitOptions`

- **Floating Panel**: Add data attributes for floating panel stage status

## [1.21.0](./#1.21.0) - 2025-07-26

### Added

- **File Upload**: Add `api.transforming` to track file transformation state when using `transformFiles`. This enables
  developers to show loading states during file processing.

### Fixed

- **Dialog**
  - Sync content `--layer-index` with positioner and backdrop
  - Decouple `trapFocus` from `modal` so it's possible to set `modal=false` and `trapFocus=true`

## [1.20.1](./#1.20.1) - 2025-07-23

### Fixed

- **Date Picker**: Fixed issue where hovered range was connect to selected values, when it shouldn't

- **Tree View**: Fixed issue where tree view doesn't scroll into view when content overflows.

## [1.20.0](./#1.20.0) - 2025-07-22

### Fixed

- **Date Picker**: Fix date comparison issues when time components are involved. This resolves critical issues with date
  comparison operations when different date types (`CalendarDate`, `CalendarDateTime`, `ZonedDateTime`) are mixed,
  particularly in scenarios involving time components.

### Added

- **Date Picker**: Added hover range preview support for date picker range selection. Added `inHoveredRange`,
  `firstInHoveredRange`, and `lastInHoveredRange` properties to `DayTableCellState` with corresponding data attributes
  `data-in-hover-range`, `data-hover-range-start`, and `data-hover-range-end`.

  Hover range states are only active when not overlapping with actual selected range, enabling distinct styling for
  hover preview vs actual selection in range mode.

## [1.19.0](./#1.19.0) - 2025-07-20

### Added

- **File Upload**: Add support for programmatically controlling the accepted files via `acceptedFiles` and
  `defaultAcceptedFiles`

- **Signature Pad**: Add support for programmatically controlling the paths via `paths` and `defaultPaths` props.

## [1.18.5](./#1.18.5) - 2025-07-19

### Added

- **JSON Tree Utils**: Add support for `groupArraysAfterLength` to truncate large arrays into chunks (reducing the
  number of DOM nodes rendered).

### Fixed

- **General**: Fix issue destructuring returned api could throw an ESLint `unbound-method` warning

- **Tree View**: Fix issue where `onExpandedChange`, `onSelectionChange` and `onFocusChange` doesn't infer the tree node
  types

- **Popper**: Expose floatingElement to the `updatePosition` function

## [1.18.4](./#1.18.4) - 2025-07-18

### Fixed

- **Collection**: Fix issue where the `filter` method completely deletes the children key from the node when there are
  no matching children

- **Number Input**: Fix issue where default pattern does not allow negative numbers with decimal point

## [1.18.3](./#1.18.3) - 2025-07-05

### Fixed

- **Carousel**: Fix issue where full page carousel could trap scrolling

- **File Upload**:
  - Fix issue where calling `api.setFiles` invokes validation with incorrect `acceptedFiles`
  - Fix issue where the browser might not be able to infer the mime type of a file due to limitations, drag source or
    security restrictions. As a fallback in the file validation logic, we now infer the mime type from the file
    extension.

## [1.18.2](./#1.18.2) - 2025-07-04

### Added

- **Collection**: Add `upsert` to list collection. Useful for making creatable items in select or combobox

### Fixed

- **Date Picker**: Fix issue where `focusedValue` could not be fully controlled
- **Toast**: Fix issue where toast `title` or `description` could not accept React or Vue elements

## [1.18.1](./#1.18.1) - 2025-07-02

### Fixed

- **Combobox**:
  - Expose `reason` to `onOpenChange` and `onInputValueChange` callbacks
  - Select highlighted item only if it exists in the collection
  - Expose `api.clearHighlightedValue` function to clear highlighted value

- **Date Picker**: Fix issue where datepicker errors when setting `selectionMode=range` and `minView=year`

- **Listbox**: Select highlighted item only if it exists in the collection

- **Progress**: Improve `valueAsString` formatting

- **Select**:
  - Select highlighted item only if it exists in the collection
  - Expose `api.clearHighlightedValue` function to clear highlighted value

- **Tour**: Fix an issue where the `goto` function in `StepActionMap` doesn't work when passing step IDs (string)

- **Tree View**: Expose `id` in the tree node state

## [1.18.0](./#1.18.0) - 2025-06-30

### Added

- **Color Picker**: Add support for `inline` prop to render color picker inline
- **Date Picker**: Add support for `inline` prop to render the date calendar inline

### Fixed

- **Aria Hidden**: Exclude elements with `role="status"` and `output` elements when applying aria-hidden
- **Color Picker**: Auto-prefix Hex values with `#` if missing when using the `hex` channel input
- **Menu**: Fix interaction outside detection for focusable context trigger
- **Tree View**: Improve support for rendering tree items as links

## [1.17.4](./#1.17.4) - 2025-06-27

### Fixed

- **Combobox, Select, Listbox**: Fix issue where rehydrating `defaultValue` or `value` after fetching items doesn't
  update the `valueAsString`

## [1.17.3](./#1.17.3) - 2025-06-27

### Fixed

- **Tree View**: Fix tree traversal for querying last node

## [1.17.2](./#1.17.2) - 2025-06-26

### Fixed

- **Angle Slider**: Fix issue where scrubbing doesn't feel smooth on touch devices

- **Timer**:
  - Fix issue where timer could continue beyond `targetMs` when window is not visible
  - Add validation to ensure `startMs` and `targetMs` are configured correctly
  - Fix `progressPercent` calculation for countdown timers

- **Tree View**: Expose node details in `onExpandChange`, `onSelectionChange` and `onFocusChange`

### Changed

- **Collection**:
  - Add support for `findNodes` to find multiple nodes by value in a single pass
  - Fix issue with `getLastNode` not returning the last node in the tree with only one branch

- **I18n Utils**: Add new `createCollator` function for locale sensitive string comparison

## [1.17.1](./#1.17.1) - 2025-06-24

### Fixed

- **Date Picker**: Fix issue with keyboard selection where setting unavailable date causes month view to behave
  differently from clicking with mouse

- **Toast**: Fix issue where app crashes when `toaster.promise` is called without loading option. The `loading` option
  is now required. A warning will be logged if it is not provided

- **Tree View**:
  - Fix issue where clicking a branch with indeterminate state doesn't check its child nodes
  - Remove `aria-busy` attribute from branch trigger when not loading children

## [1.17.0](./#1.17.0) - 2025-06-23

### Fixed

- **Progress**: Fix issue where setting orientation to `vertical` don't work
- **Progress**: Fix issue where setting `defaultValue` to `null` doesn't show indeterminate state

### Changed

- **Tree View**: Rename `getItemCheckboxProps` to `getNodeCheckboxProps` since it can be used in both items and branches

## [1.16.0](./#1.16.0) - 2025-06-21

### Added

- **Tree View**
  - Add support for checkbox state for checkbox trees via `defaultCheckedValue`, `checkedValue`, `onCheckedChange` props
  - Add callback for when `loadChildren` fails via `onLoadChildrenError` prop
  - Add `api.getCheckedMap` method to get the checked state of all nodes

- **Tree Collection**: Add support for `getDescendantNodes` and `getDescendantValues`

### Fixed

- **Tree View**: Fix issue where `api.collapse` and `api.deselect` throws error when called without arguments
- **General**: Add better support for TypeScript's `exactOptionalPropertyTypes` compiler option

## [1.15.7](./#1.15.7) - 2025-06-19

### Fixed

- **Collection**: Fix issue where tree collection filter method returns empty children for leaf item.

## [1.15.6](./#1.15.6) - 2025-06-18

### Fixed

- **General**: Ensure pointerdown or click event handlers only execute when the main button is clicked

### Changed

- **Collection**: Improve the APIs around `tree.flatten(...)` and `flattenedToTree` to ensure the original node
  properties are preserved.

  > Previously, `tree.flatten()` would return an array of objects with `value` and `label` stripping out the original
  > node properties.

  ```ts
  const tree = new TreeCollection({
    rootNode: {
      value: "ROOT",
      children: [{ value: "child1" }, { value: "child2" }],
    },
  })

  const flattened = tree.flatten()
  const reconstructed = flattenedToTree(flattened)

  console.log(reconstructed.rootNode)

  // {
  //   value: "ROOT",
  //   children: [{ value: "child1" }, { value: "child2" }],
  // }
  ```

## [1.15.5](./#1.15.5) - 2025-06-17

### Fixed

- **Combobox**: Fix issue where combobox with `allowCustomValue: true` used within in a form requires two enter keypress
  to submit

## [1.15.4](./#1.15.4) - 2025-06-16

### Fixed

- **Menu, Combobox**: Fix issue in Svelte where menu and combobox items rendered as links don't work
- **Toggle Group**: Fix issue in Svelte where toggle group doesn't work due to blur timing

## [1.15.3](./#1.15.3) - 2025-06-13

### Fixed

- **Popover**: Fix issue where `onOpenChange` could be called twice when controlled
- **File Utils**: Improve `downloadFile` function to handle webview scenarios
- **Combobox**: Fix issue where `onInputValueChange` could be called twice when selecting an item

## [1.15.2](./#1.15.2) - 2025-06-10

### Fixed

- **Menu**: Refactor `getItemTextProps` and `getItemIndicatorProps` to accept a partial interface of option item.

## [1.15.1](./#1.15.1) - 2025-06-10

### Added

- **[NEW]Async List**: Initial release of async list controller
- **Editable**: Add support for `activationMode=none`
- **Collection**:
  - Expose `copy` method
  - Allow `getParentNodes` to accept a value or index path

### Fixed

- **Carousel**: Fix issue where carousel crashes when `slidesPerPage` is 0
- **File Upload**: Prevent `undefined` in `acceptedFiles` when no files accepted
- **Select**: Fix issue where highlighted item could be cleared when navigating up/down the list with keyboard
- **Tabs**: Fix issue where tabs with links should not trigger tab change upon cmd/middle click

## [1.15.0](./#1.15.0) - 2025-06-05

### Added

- **Tree View**: Add support for lazy loading node children. To use this, you need to provide:
  - `loadChildren` is a function that is used to load the children of a node.
  - `onLoadChildrenComplete` is a callback that is called when the children of a node are loaded. Used to update the
    tree collection.
  - Add `childrenCount` to the node object to indicate the number of children.

```tsx
function TreeAsync() {
  const [collection, setCollection] = useState(initCollection)

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    async loadChildren({ valuePath, signal }) {
      const url = `/api/file-system/${valuePath.join("/")}`
      const response = await fetch(url, { signal })
      const data = await response.json()
      return data.children
    },
    onLoadChildrenComplete({ collection }) {
      setCollection(collection)
    },
  })

  // ...
}
```

### Fixed

- **Collapsible**: Fix rect measurement timing issue in Svelte
- **Remove Scroll**: Fix scrollbar width calculation before DOM change for scroll-lock workaround compatibility
- **Slider**:
  - Fix issue where `Shift` + `ArrowRight` set value to `0` instead of `max` when step is too large (e.g. `20`)
  - Fix issue where `onValueChangeEnd` doesn't return the latest value when dragging very fast

## [1.14.0](./#1.14.0) - 2025-05-29

### Added

- **File Upload**: Add support for transforming uploaded files via `transformFiles` context property.

```tsx
const service = useMachine(fileUpload.machine, {
  id: useId(),
  accept: ["image/jpeg", "image/png"],
  transformFiles: async (files) => {
    return Promise.all(files.map((file) => compress(file, { size: 200 })))
  },
})
```

### Fixed

- **Slider**: Fix issue where `minStepsBetweenThumbs` isn't computed correctly when interacting with pointer or
  keyboard.

## [1.13.1](./#1.13.1) - 2025-05-27

### Fixed

- **Password Input**
  - Export missing types for `Api` and `Service`
  - Add `api.toggleVisible` function to toggle the visibility of the password input
  - Implement `translations` prop to customize the visibility trigger accessibility label

## [1.13.0](./#1.13.0) - 2025-05-26

### Added

- **[New] Password Input**: Add password input machine for displaying a password input field.
- **Select**: Add `onSelect` callback that gets fired when an item is selected via keyboard/mouse.

### Fixed

- **Color Picker**: Fix issue where value change end event is invoked when committing via an input.

- **Svelte**: Fix issue with microtask timing in svelte `5.28.3+`.

- **Toast**: Fix issue where calling `toast.remove()` without an id shows a TypeScript error.

## [1.12.4](./#1.12.4) - 2025-05-20

### Fixed

- **Svelte**: Improve reactivity of synchronous state updates.

## [1.12.3](./#1.12.3) - 2025-05-16

### Fixed

- **Carousel**:
  - Fix issue where focusing on carousel region and navigating with keyboard doesn't work as expected
  - Fix issue when `allowMouseDrag` is set where carousel no longer snaps after mouse interaction

- **Combobox**: Fix issue where `onInputValueChange` doesn't get called when `autoFocus` is set to `true`

- **Focus Visible**: Fix an issue where an assignment to the browser's `HTMLElement` prototype is not supported (e.g.
  happy-dom)

- **Preact**: Remove `react` and `react-dom` from peerDependencies

- **Slider**: Fix issue where slider could throw a error when rendered in an popover or dialog

- **Svelte**: Improve reactivity when events don't trigger a state transition

- **Tour**: Fix issue where calling `api.start(<id>)` with a step id doesn't work as expected

## [1.12.2](./#1.12.2) - 2025-05-12

### Fixed

- **Select, Menu, Tabs**: Fix type issue with the `navigate` prop

## [1.12.1](./#1.12.1) - 2025-05-12

### Fixed

- **Collection**: Fix issue where `getNextValue` and `getPreviousValue` doesn't work as expected when `groupBy` is used.

- **Combobox**:
  - Fix issue in Vue.js where combobox doesn't work for items rendered as link
  - Add `href` to params in `navigate` context property

- **Menu, Tabs**: Add `href` to params in `navigate` context property

## [1.12.0](./#1.12.0) - 2025-05-01

### Added

- **Date Picker**: Add support for `outsideDaySelectable` prop to allow selecting days outside the current month (on the
  same visible date range)

### Fixed

- **Collapsible**: Fix issue in React.js <= v18.x where collapse animation might not work as expected

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
