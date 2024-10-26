# CHANGELOG

All notable changes to this project will be documented in this file.

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

## [0.76.0](./#0.76.0) - 2024-10-26

### Fixed

- **TagsInput**: Fix issue where `api.addTag(...)` doesn't work in tags input
- **RatingGroup**: Fix issue where both rating group and rating item have focus when `readOnly` is set to `true`
- **Combobox**: Fix issue where `getSelectionValue` could gets called multiple times. Now, it only gets called when a
  selection is made
- **HoverCard**: Remove prevent default calls on touch start event to avoid browser error log

### Added

- **Collection**: Add `TreeCollection` utility to traverse trees in the treeview and cascader components

## [0.75.0](./#0.75.0) - 2024-10-18

### Fixed

- **Popover**: Fix race condition in iOS Safari where switching between multiple popovers causes both to close
  unexpectedly.

- **Presence**: Fix issue where elements that use the presence machine doesn't exit unmounting state when closed with
  delay and the active tab is switched.

  This is because the v8 engine doesn't trigger the animationend event when the tab is inactive even though the
  "present" state had changed before the tab is switched.

### Added

- **Slider**: Add support for rendering a dragging indicator when a thumb is dragged by using
  `api.getDraggingIndicatorProps(...)`.

- **Editable**: Add `data-autoresize` to editable and preview parts when autoresize is enabled.

### Changed

- **Editable**: When `autoResize` is enabled, we removed the default `all: unset` applied to the input in favor of
  userland css. Please add this in your userland css.

```css
[data-scope="editable"][data-part="input"][data-autoresize] {
  all: unset;
}
```

## [0.74.2](./#0.74.2) - 2024-10-09

### Fixed

- **TimePicker**: Export missing `Time` type

## [0.74.1](./#0.74.1) - 2024-10-09

### Fixed

- **TimePicker**: Resolve an issue that `@internationalized/date` was not declared as peer dependency.

## [0.74.0](./#0.74.0) - 2024-10-09

### Fixed

- **TagsInput**: Fix issue where tags input doesn't navigate tags after removing with the delete key

- **DatePicker**: Fix issue in date range picker where clicking a preset trigger and blurring the input resets the value
  incorrectly.

### Added

- **ColorPicker**: Add support for `grey` named colors and `rebeccapurple` color resolution.

### Changed

- **DatePicker, TimePicker [BREAKING]**: Move `@internationalized/date` to peer dependency to prevent mismatching type
  errors.

## [0.73.0](./#0.73.0) - 2024-09-30

### Added

- **Dialog**

  - Add support for detecting outside clicks from parent windows when rendered within an iframe

### Fixed

- **Combobox**

  - Fix issue where pressing enter without selecting an option leaves text in the input

- **File Upload**

  - Fix issue where `acceptedFiles` is removed after an invalid file is uploaded

- **Dialog**

  - Fix issue where dialog closes when positioner is scrollable and the scrollbar is clicked

## [0.72.0](./#0.72.0) - 2024-09-28

### Added

- **Select, Combobox**

  - Expose `multiple` and `disabled` in api to allow for designing custom UIs.

### Changed

- **Tour [BREAKING]**

  - Refactor tour to be more robust and support programmatic control in wait steps.

## [0.71.0](./#0.71.0) - 2024-09-23

### Changed

- **All Packages**

  - Update all packages to no longer ship `src` directory.

### Fixed

- **Steps**

  - Fix issue where past step item had `data-incomplete` on it.
  - Rename `api.value` to `api.step`
  - Rename `api.setValue` to `api.setStep`

- **DatePicker**

  - Fix issue where date picker could close when composed in a dialog or popover.

### Added

- **FileUpload**

  - Add support for `api.getClearTriggerProps()` to render a clear trigger that clears the accepted files.

## [0.70.0](./#0.70.0) - 2024-09-22

### Changed

- **Combobox**

  - Remove `flip: false` default positioning option to ensure consistency with select.

### Added

- **Select, Tabs**

  - Add support for `deselectable` prop to allow deselecting the current value by clicking on the item.

## [0.69.0](./#0.69.0) - 2024-09-21

### Fixed

- **FileUpload**

  - Fix issue where `directory: true` doesn't work

### Added

- **Switch, Checkbox, Radio Group**

  - The `data-focus-visible` attribute to the selected radio button when it is interacted with the keyboard.

- **Tooltip**

  - Focus behavior only opens when the tooltip trigger is focused with keyboard.

## [0.68.0](./#0.68.0) - 2024-09-15

### Fixed

- **DatePicker**

  - Fix issue where partial YY format in date string was not parsed correctly.
  - Fix issue in Vue.js where input value could not be changed by typing.
  - Fix issue where setting controlled `min` and `max` values throws an error.

- **TreeView**

  - Fix issue where programmatic selection does not account for singular selection

## [0.68.0](./#0.68.0) - 2024-09-12

### Fixed

- **Combobox**

  - Fix issue where highlighted item was persistent when the collection is empty

### Changed

- **Timer**

  - Introduces new area and control parts for better anatomy and structure.
  - [BREAKING] Move `role"timer` to new area part.
  - Automatically hide the action triggers based on the action prop passed.

**BEFORE:**

```tsx
<div>
  <div {...api.getRootProps()}>
    <div {...api.getItemProps({ type: "days" })}>{api.formattedTime.days}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
  </div>
  <div>
    <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
    <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
    <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
    <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
  </div>
</div>
```

**AFTER:**

```tsx
<div {...api.getRootProps()}>
  <div {...api.getAreaProps()}>
    <div {...api.getItemProps({ type: "days" })}>{api.formattedTime.days}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "hours" })}>{api.formattedTime.hours}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
    <div {...api.getSeparatorProps()}>:</div>
    <div {...api.getItemProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
  </div>
  <div {...api.getControlProps()}>
    <button {...api.getActionTriggerProps({ action: "start" })}>START</button>
    <button {...api.getActionTriggerProps({ action: "pause" })}>PAUSE</button>
    <button {...api.getActionTriggerProps({ action: "resume" })}>RESUME</button>
    <button {...api.getActionTriggerProps({ action: "reset" })}>RESET</button>
  </div>
</div>
```

- **Popper**

  - Add support for `hideWhenDetached` positioning option. This can be used in the `positioning` options for floating
    components (select, popover, dialog, etc.)

## [0.67.0](./#0.67.0) - 2024-09-10

### Added

- **Highlight**

  - Released `@zag-js/highlight-word` package to help with highlighting text in a string.

### Fixed

- **Date Utils**

  - Fixed issue where `getWeekDays` had inconsistent behavior when both locale and `startOfWeekProp` were set

- **Menu**

  - Fixed issue where lazy mounting the content caused the first menu item to not be focused when opened with keyboard

## [0.66.0](./#0.66.0) - 2024-09-05

### Fixed

- **Floating Components**

  - Fix issue where clicking outside of a dialog on mobile passes click events through

- **Popover**

  - Fix issue where popover does not restore focus when open state is changed programmatically

- **Avatar**

  - Fix issues where avatar could throw when the fallback inner text changes.

- **Steps**

  - Improve accessibility of tablist semantics by using `aria-owns`

### Added

- **FileUpload**

  - Add support for more file types in file upload `accept` intellisense

- **Toast**

  - Add support for `action` in toast options, giving you the ability to add a `action.label` and `action.onClick`. The
    `onClick` function will be called when the user clicks the action trigger.

```ts
api.create({
  title: "Uploaded successfully",
  type: "success",
  action: {
    label: "Undo",
    onClick: () => {
      console.log("undo")
    },
  },
})
```

### Changed

- **Floating Components**

  - Refactor `boundary` to only support function that returns an element.

- **Select**

  - Refactor opening and selection to be based on click events rather than pointerdown/up cycles.
  - Improve usability and accessibility of the select component.
  - Fix issue where controlled multiple selects open state behaved unexpectedly.

- **File Upload**

  - Add support for `invalid` prop in file upload to explicitly mark upload operation as invalid. This could be paired
    with the `rejectedFiles` to show an error message.

## [0.65.1](./#0.65.1) - 2024-08-20

### Fixed

- **Popover**

  - Fix issue where popover doesn't restore focus when controlled
  - Fix issue where clicking the close button doesn't restore focus to the trigger

- **Svelte**

  - Fix issue where `peerDependencies` were configured incorrectly

## [0.65.0](./#0.65.0) - 2024-08-08

### Fixed

- **Dialog**

  - Fix issue where closing a nested dialog focuses the first focusable element in the parent dialog instead of the
    previously focused element.

### Added

- **Editable**

  - Add support for controlled the editable's state (edit/preview) using `edit` and `onEditChange`

- **Pagination**

  - Expose `api.count` property

### Changed

- **Editable**

  - Removed `onEdit` in favor of `onEditChange`
  - Removed `startsWithEditView` in favor of `edit` prop

## [0.64.0](./#0.64.0) - 2024-08-01

### Fixed

- **NumberInput**

  - Fix issue where pressing enter key, doesn't make arrow up and down work as expected

### Added

- **Collection**

  - Introduce new `GridCollection` to manage grid base navigation and selection

### Changed

- **Collection [BREAKING]**

  - Rename `Collection` class to `ListCollection` to better reflect its intent

## [0.63.0](./#0.63.0) - 2024-07-28

### Fixed

- **DatePicker**

  - Fix issue where selected date doesn't reflect in input when you click trigger then focus input
  - Fix SSR issue when using `getPresetTrigger`

- **Slider**

  - Fix issue where `onValueChangeEnd` gets called with incorrect value

- **Timer**

  - Fix an issue that action trigger did not emit an event

### Added

- **DatePicker**

  - Add support for `index` in `getLabelProps`

## [0.62.1](./#0.62.1) - 2024-07-27

### Fixed

- **TimePicker**

  - Export missing `TimePicker` types

- **Toast**

  - Add missing `aria-labelledby` and `aria-describedby` attributes on the toast root element

- **React**

  - Fix regression with `useMachine` where HMR could lead to `Maximum call stack exceeded` error

### Added

### Changed

## [0.62.0](./#0.62.0) - 2024-07-23

### Fixed

- **Combobox**

  - Improve accessibility by removing `aria-selected` and `aria-disabled` when `false`
  - Prefer `click` over `pointerup` for consistent experience between screen readers and pointers.

- **React**

  - Improve HMR behavior in React with components like Dialog, Select, and Menu

### Changed

- **Steps**

  - Rename `skippable` to `linear` prop to better communicate its intent
  - Set default `orientation` to `horizontal`

## [0.61.1](./#0.62.0) - 2024-07-15

### Fixed

- **Tags Input**

  - Fix issue where tag input does not allow for repeat pasting and undo
  - Fix issue where deleting a pasted value completely disables pasting
  - Ensure value set in the machine are always unique, discarding duplicates

- **Select**

  - Fix issue where `closeOnSelect` could not be customized when `multiple` is set to `true`

## [0.61.0](./#0.61.0) - 2024-07-08

### Fixed

- **RadioGroup**

  - Ensure consistent click events for radio group item.
  - Fix issue where `data-readonly` attribute was misspelt

### Added

- **Tooltip**

  - Add support for `closeOnClick` to determine if the tooltip should close when trigger is clicked.

## [0.60.0](./#0.60.0) - 2024-07-05

### Fixed

- **All Machines**

  - Improve reliability in web runtime by wrapping the `process.env` check in a function

- **Combobox**

  - Fix issue where Combobox doesn't update the input on selection with pointer

### Added

- **[NEW] Steps**

  - Add new steps machine to create a step-by-step wizard or onboarding experience

## [0.59.0](./#0.59.0) - 2024-06-29

### Fixed

- **Select, Combobox**

  - Improve reliability of select and combobox by redesigning the collection interface

- **TreeView**

  - Fix issue where inputs could not be used within tree

### Added

- **ColorPicker, Select, NumberInput**

  - Add support for valueText part for rendering internal state value

## [0.58.3](./#0.58.3) - 2024-06-27

### Fixed

- **Combobox**

  - Fix issue where input shows values when `multiple` is set to `true`. The design intent is that when combobox is set
    to `multiple`, values should be rendered outside the
  - Expose `data-placement` on Content

- **Progress**

  - Fix issue where progress circle throws warning due to incorrect `viewBox` attribute on `<svg>`

- **Carousel**

  - Fix issue where next and previous buttons don't loop currently when using setting both `slidesPerView` and `loop`

- **Presence**

  - Fix issue where presence doesn't close if close animation has duration of `0s`

- **Select, Combobox**

  - Expose `data-invalid` on Combobox and Select triggers

- **Menu**

  - Fix context menu losing position data on close
  - Fix issue where context menu doesn

## [0.58.0](./#0.58.0) - 2024-06-21

### Fixed

- **All Machines**

  - Ensure consistent application of form related properties like `invalid`, `required`, and `readOnly`.

  - Export `Service` from all machines for use in Lit based components.

- **Tooltip**

  - Fix issue where `closeOnScroll=false` doesn't work consistently in Safari

### Added

- **Alert**

  - Expose more functions to programmatically change the page like `api.goToNextPage()`, `api.goToPrevPage()`,
    `api.goToFirstPage()`, `api.goToLastPage()`

- **DatePicker**

  - Add support for customizing date picker accessibility labels

- **FileUpload**

  - Add support for `api.clearRejectedFiles` to allow clearing the rejected files programmatically.

  - Improve DX of the `accept` context property by providing autocompletions for common file type

## [0.57.0](./#0.57.0) - 2024-06-14

### Fixed

- **Editable**

  - Fix issue where setting `activationMode=dblclick` clears the input value unexpectedly.

- **SignaturePad**

  - Add `role=application` to signature pad control. This fixes the accessibility violation with `aria-roledescription`

- **Menu**

  - Fix issue where sibling menus or popovers don't work well on iOS mobile devices.
  - Fix issue where context menu trigger shows the magnifier and iOS context menu on long press.

### Added

- **Select**

  - Add support for selecting all values using `api.selectAll()`

- **Tooltip**

  - Add support for `closeOnScroll` to control whether the tooltip should close when the trigger's overflow parent
    scrolls.

- **ColorPicker**

  - Add support for channel slider label and value text parts
  - Allow passing `format` to channel slider parts. Useful for building slider only color pickers
  - Add `api.getChannelValueText` to get the formatted value text for specific channel slider

- **Slider**

  - Expose `data-dragging` to the component parts when dragging the slider thumb. This allows you to style the slider
    parts differently when the thumb is being dragged.

## [0.56.1](./#0.56.1) - 2024-06-11

### Fixed

- **All Machines**: Ensure consistent handling of `readOnly` and `disabled` context properties
- **QrCode**: Fix issue where QrCode types are not exported

## [0.56.0](./#0.56.0) - 2024-06-10

### Fixed

- **Menu**

  - Fix issue where using anchor as menuitem hijacks focus prematurely

### Added

- **Presence**

  - Add support for `immediate` to synchronize the present change immediately instead of deferring to next tick. This
    should be used when composing components like `Tabs`.

- **RadioGroup, Tabs**
  - Add `data-ssr` to item as a style hook to mimick the indicator styles while in ssr. This improves the visual
    experience and prevents the indicator flashing on hydration

### Changed

- **Timer [Breaking]**

  - Refactor anatomy for timer machine.
    - Before: `root`, `segment`, `control`, `separator`
    - After: `root`, `item`, `itemValue`, `itemLabel`, `actionTrigger`, `separator`,

## [0.55.0](./#0.55.0) - 2024-06-07

### Fixed

- **FileUpload**

  - Fix issue where `onFileAccept` gets called when deleting an item via the delete trigger. Now, only `onFileChange` is
    called when deleting or calling `api.clearFiles`

- **Combobox, Select**

  - Add missing list part

### Added

- **[NEW]**: Added new QR Code machine to generate QR codes from text or URLs.

### Changed

## [0.54.0](./#0.54.0) - 2024-06-05

### Changed

- **All Machines**

  Update all machines to use prop getters everywhere. This helps to improve render performance and reduce breaking
  changes in the future.

  ```jsx
  rootProps -> getRootProps()
  labelProps -> getLabelProps()
  ```

## [0.53.0](./#0.53.0) - 2024-06-03

### Fixed

- Removed stray `console.log`

### Added

- **Svelte**

  - Fix svelte runes warning for `$state` usage in `useMachine` hook
  - Add `reflect` utility to help design system maintainers manage `api` reactivity
  - Add and expose `PropTypes` type to improve type safety in spread props

## [0.52.0](./#0.52.0) - 2024-06-02

### Fixed

- **Solid.js**

  - Fix SSR issue in Solid.js where spreading `readOnly: false` adds the `readonly` attribute on editable elements,
    making them uneditable.

- **Popover**

  - Fix issue where `autoFocus` was not implemented. Now, it determines whether the popover should autofocus on open

    - when `true`, the first focusable element or the content is focused
    - when `false`, the content is focused

  - Fix the issue where page scroll resets on opening popover

- **Select**

  - Fix issue where changing the label of a collection item doesn't trigger a change in select and combobox components.

### Added

- **Editable**
  - Allow using `textarea` as the input element in edit mode.

## [0.51.2](./#0.51.2) - 2024-05-28

### Fixed

- **General**

  - Fix events merging in `mergeProps` utility
  - Fix issue where keydown event might not fire in React due to `nativeEvent` currentTarget not been set sometimes.

- **Avatar**

  - Improve image load check to use `naturalWidth|Height` instead of `currentSrc`

## [0.51.0](./#0.51.0) - 2024-05-23

### Fixed

- **FileUpload**

  - Fix issue where hidden input doesn't include the file list when dropping files on the dropzone

- **Progress**

  - Fix issue where using a smaller `max` than `50` throws due to the fact the default `value` is set to `50`. Now we
    set the default `value` to mid value between the `min` and `max`

### Added

- **[NEW]**: Added new Timer machine to create a timer (countdown or stopwatch) that can be paused, resumed, and reset.

- **[NEW]**: Added new TimePicker machine to that allows selecting a time and day period.

- **Pagination**

  - Add `api.pageSize` to allow retrieving the current page size
  - Add `onPageSizeChange` to listen for page size change

- **Editable**

  - Add `api.valueText` that returns the current value or placeholder if empty

### Changed

## [0.50.0](./#0.50.0) - 2024-05-15

### Fixed

- **React**

  - Fix issue where controlled context can sometimes not be synced correctly

- **Collection**

  - Ensure collection are considered different when item's disabled property changes

- **Popover, Menu, Select**
  - Fix issue where positioner does not respect the `offset.crossAxis`

### Added

- **Dialog, Popover**:

  - Add support for `persistElements` to prevent third-party elements from having `pointer-events: none` applied to them
    and closing when you interact with them.

- **Dialog**

  - Prevent closing dialog on outside click when `role=alertdialog` is set.
  - Set the initial focus to the close trigger, when `role=alertdialog` is set to prevent accidental selection of
    destructive action.

- **Slider**

  - Invoke `onValueChangeEnd` when using keyboard to interact with slider thumb

- **Tabs, Combobox, Select, Menu**:
  - Add new `composite` prop to allow for composing these components within themselves.

### Changed

- **Combobox**

  - Rename `triggerProps` to `getTriggerProps()` to allow for more flexible compositions

- **Popover, Tooltip**

  - Rename `closeOnEsc` to `closeOnEscape` to be consistent with dialog machine

- **Tabs**
  - When using the pointer, prefer click based selection when using `activationMode=automatic` over focus triggering
    selection. For keyboard, selection follows focus as usual

## [0.49.0](./#0.49.0) - 2024-04-26

### Fixed

- **Store, React**

  - Fix issue where multiple versions of `@zag-js/store` could lead to "proxy state is not iterable" errors

- **Collapsible**

  - Fix issue where initial height animation can sometimes run

- **DatePicker**

  - Fix issue where date picker content doesn't register as a dismissable when lazy mounted
  - Fix issue where changing focused value doesn't update the date picker's visible range

- **Splitter**

  - Fix issue where `onResize` was not called

- **TagsInput**

  - Fix issue where editing a tag and clearing it's value leaves an empty tag. Now, empty tags will be deleted
  - Fix issue where deleting a tag with pointer and navigating with keyboard doesn't work

### Added

- **Presence**

  - Add `api.unmount` to programmatically unmount the component
  - Add `api.skip` to skip initial animation

## [0.48.0](./#0.48.0) - 2024-04-22

This release marks the journey to a more stable and consistent API across all components. We've made significant
changes.

### Fixed

- **Collapsible**

  - Resolve an issue that sometimes the collapsible height was not measured correctly

- **Toast**

  - Fix an issue where toast hide immediately after updating
  - Fix an issue that the height was not exactly measured

- **Select, Combobox**
  - Fix issue where `value` is unintentionally sorted when highlighting item

### Added

- **Checkbox, RadioGroup, Switch**

  - Add support for `readOnly` prop to prevent user interaction from changing the checkbox state

- **Combobox**

  - Add support for controlling the open state of the combobox via `open` and `onOpenChange`
  - Add new `openOnChange` property to automatically open the combobox when the value changes. Value can be a boolean or
    a function that returns a boolean.

  ```jsx
  const [state, send] = useMachine(
    combobox.machine({
      openOnChange: ({ inputValue }) => inputValue.length > 2,
    }),
  )
  ```

  - Add new `openOnKeypress` property to automatically open the combobox when the arrow keys (up and down) are pressed.
  - Add `persistFocus` to the item props to determine whether to clear the highlighted item on pointer leave.

### Changed

- **All machines**

  - Rename all api to return consistent boolean properties. This means going from `is<X>` to `<x>`. For example,
    `isDisabled` -> `disabled`, `isFocused` -> `focused`, `isOpen` -> `open`, etc.
  - Rename `open()`, `close()` methods to `setOpen(true|false)`
  - Remove `selectOnBlur` to prevent accidental selection of options. Prefer explicit selection by user via click or
    enter key.

- **Accordion**

  - Rename `getItemState` properties
    - `isOpen` -> `expanded`
    - `isDisabled` -> `disabled`
    - `isFocused` -> `focused`

- **Avatar**

  - Rename `api.isLoaded` to `api.loaded`
  - Remove `api.showFallback` since it's equivalent to `!api.loaded`

- **Carousel**

  - Rename `isCurrent` to `current`
  - Rename `isNext` and `isPrevious` to `next` and `previous` respectively
  - Rename `isPrevious` to `previous`

- **Clipboard**

  - Rename `api.isCopied` to `api.copied`

- **File Upload**

  - Rename `api.open()` -> `api.openFilePicker()`

- **Menu**

  - Menu now focuses the first tabbable element when it opens. This allows for composition with combobox
  - Rename `loop` to `loopFocus` to better reflect its purpose

- **TagsInput**
  - Rename `allowTagEdit` to `editable`
  - Add `onInputValueChange` to machine context

## [0.47.0](./#0.47.0) - 2024-04-19

### Fixed

- **Select**
  - Prevent tab key interaction when the select is open. This keeps focus within the select and ensures keyboard
    interactions work consistently

### Changed

- **Toast [BREAKING]**:

  - Simplify toast api methods

  ```diff
  <ToastContext.Provider value={api}>
  -    {Object.entries(api.getToastsByPlacement()).map(([placement, toasts]) => (
  +    {api.getPlacements().map((placement) => (
          <div key={placement} {...api.getGroupProps({ placement })}>
  -           {toasts.map((toast) => (
  +           {api.getToastsByPlacement(placement).map((toast) => (
                  <Toast key={toast.id} actor={toast} />
              ))}
          </div>
      ))}
      {children}
  </ToastContext.Provider>
  ```

  - Fix issue where toast closes when you update the same toast type

## [0.46.0](./#0.46.0) - 2024-04-12

### Fixed

- **Checkbox, Switch**

  - Fix issue where `data-active` doesn't get removed when pointer is release outside the element

- **Toast**
  - Fix issue where toast closes when updated without `type` or `duration`

### Added

- **Signature Pad [NEW]**

  - Add new signature pad machine to allow capturing user signature

- **Svelte**
  - Add support for `useActor` hook to be consistent with other frameworks

### Changed

- **Avatar [Breaking]**

  - Change `onLoadingStatusChange` to `onStatusChange` to match naming convention across machines

- **Clipboard [Breaking]**

  - Change `onCopyStatusChange` to `onStatusChange` to match naming convention across machines

- **Toasts [Breaking]**

  - Add support for overlapping toasts by setting `overlap: true` in the `toast.group` machine context
  - Remove `pauseOnInteraction` in favor of always pausing on hover. This is required for accessibility reasons (there
    should always be a way to pause the widgets with time-based interactions)
  - Remove `onOpen`, `onClose` and `onClosing` in favor of `onStatusChange` which reports the lifecycle status of the
    toast
  - Impose new required styling for toast to work as designed. Here's a quick example of the required styling:

  ```css
  [data-scope="toast"][data-part="root"] {
    translate: var(--x) var(--y);
    scale: var(--scale);
    z-index: var(--z-index);
    height: var(--height);
    opacity: var(--opacity);
    will-change: translate, opacity, scale;
    transition:
      translate 400ms,
      scale 400ms,
      opacity 400ms;
  }

  [data-scope="toast"][data-state="closed"] {
    transition:
      translate 400ms,
      scale 400ms,
      opacity 200ms;
  }
  ```

  - Require new `ghostBeforeProps` and `ghostAfterProps` props to ensure the hover interaction works as expected

## [0.45.0](./#0.45.0) - 2024-04-04

### Changed

- **Solid**: Rewrite `mergeProps` to prevent issues with children that read from context, and ensure props are always
  up-to-date.

## [0.44.0](./#0.44.0) - 2024-04-03

### Added

- **Tags Input**: Support for `RegExp` in delimiter

### Changed

- **Avatar**: Remove hardcoded `style` to allow more flexible styling

## [0.43.0](./#0.43.0) - 2024-04-02

### Changed

- **Menu [Breaking]**

  - Rename `getOptionItemIndicatorProps` to `getItemIndicatorProps`
  - Rename `getOptionItemTextProps` to `getItemTextProps`
  - Changed `data-part` to match new anatomy
    - `option-item` -> `item`
    - `option-item-indicator` -> `item-indicator`
    - `option-item-text` -> `item-text`

- **File Upload [Breaking]**

  - Remove `files` form user defined context. File upload, just like `<input type=file>`, is largely a readonly
    operation that can't be set by the user.

    > Consider using the `onFileChange` event to handle file changes.

  - Rename `api.files` to `api.acceptedFiles`
  - Rename `onFilesChange` to `onFileChange`

## [0.42.0](./#0.42.0) - 2024-04-01

### Added

- **File Upload**
  - Add support selecting directories via `directory` prop
  - Add support for `capture` property that specifies which camera to use for capture of image or video

### Changed

- **Menu [Breaking]**
  - Removed `value` and `onValueChange` in favor of using explicit state to manage option items, and passing `checked`
    and `onCheckedChange` to the `getOptionItemProps` callback.
  - Prefer `value` over `id` in `getItemProps` and `getOptionItemProps` for consistency with other machine.
  - `onSelect` now provides `value` not `id` in its details.

## [0.41.0](./#0.41.0) - 2024-04-01

### Fixed

- **Select**
  - Fix issue where select doesn't work in forms when `readOnly: true` is set
  - Fix issue where initial value was not synced with hidden select element

### Added

- **Dialog**: Sync `zIndex` of content with positioner and backdrop via `--z-index` css variable. This helps with
  stacking order when using multiple dialogs.

- **Dismissable**: Improve interaction outside logic when layer rendering is deferred (via Portals or unmounted)

- **Utilities**: Add support for `formatDate` and `formatList` functions that use the underlying `Intl.*`
  implementations

### Changed

- **Tooltip**: Set tooltip `interactive` to `false` by default

## [0.40.0](./#0.40.0) - 2024-03-26

### Fixed

- **Circular Progress**: Fix issue where circular progress circle diameter doesn't get calculated correctly
- **Combobox**:
  - Fix issue where input doesn't clear when `selectionBehavior` is set to `clear`
  - Fix issue where input doesn't show initially selected `value`
  - Fix issue where empty input was replaced by selected value string when typing

### Added

- **[NEW]** Introduce new floating panel machine for draggable and resizable panels
- **Select**
  - Add `data-placement` to the select content to make it easier to style
  - Add support for `scrollToIndexFn` to be used with virtualization libraries
  - Add support for `highlightedIndex` in the `onHighlightChange` callback

### Changed

- **Svelte**: Unify API for `useService` and `useMachine` with other frameworks

## [0.39.0](./#0.39.0) - 2024-03-19

### Fixed

- **Select**: Fix issue where multiple select doesn't work correctly in forms.
- **DatePicker**: Remove unused `parse` function
- **TagsInput**: Fix issue where setting `addOnPaste` to `false` and pasting text prevents subsequent tags from being
  added
- **Progress**: Fix issue where progress throws when value is initially set to `null`
- **Popper**: Fix issue where `crossAxis` positioning property doesn't work in some cases.
- **Combobox**: Fix issue where clear trigger remains hidden when initial value is set.

### Added

- **Slider**: Add support for custom `name` attribute on the thumb element
- **Splitter**: Add `data-orientation` attribute to splitter panel
- **Menu**: Expose `onEscapeKeyDown` event handler

### Changed

> 💥 Breaking changes

- **Tabs**: Rename `api.tablistProps` to `api.listProps` to match naming convention
- **Dismissable**: Use capture phase for escape keydown handling

## [0.38.1](./#0.38.1) - 2024-03-08

### Fixed

- **DatePicker**

  - Fix issue where next and previous had the wrong aria labels
  - Fix an issue wher close on click outside does not get called when conditionally rendered

- **FileUpload**: Fix an issue where `onFileReject` would not be called

- **Switch**: Fix accessibility issue where `aria-readonly` was incorrectly set on the wrong element.

## [0.38.0](./#0.38.0) - 2024-02-26

### Added

- **Collapsible**: Add `onExitComplete` to listen for exit animation completion.

## [0.37.2](./#0.37.2) - 2024-02-25

### Fixed

- **Collapsible**: Fix issue where collapsible doesn't work when content is initially unmounted, or no animation is
  attached.

## [0.37.1](./#0.37.1) - 2024-02-24

### Fixed

- **Collapsible**: Fix issue where collapsible doesn't work when content is initially unmounted, or no animation is
  attached.

## [0.37.0](./#0.37.0) - 2024-02-21

### Added

- **Tour**: Add new `Tour` component to guide users through a series of steps in an application.
- Expose all machine context properties as array to improve DX of building design system components.

### Fixed

- **TreeView**: Add missing `getBranchIndicator` function and other minor fixes.

## [0.36.3](./#0.36.3) - 2024-02-16

### Fixed

- **Collapsible**: Export missing types for clipboard machine
- **Tooltip**: Fix issue where disabled tooltip flashes when hovering and clicking the trigger

## [0.36.2](./#0.36.2) - 2024-02-13

### Fixed

- **Clipboard**: Export missing types for clipboard machine

## [0.36.1](./#0.36.1) - 2024-02-13

### Fixed

- **HoverCard**: Remove superfluous log message when card was hovered

## [0.36.0](./#0.36.0) - 2024-02-13

### Fixed

- Refactor scroll utilities to safely handle null element values in test environment
- **Dialog**: Prevent calling interaction outside logic when scrollbar is clicked

### Added

- **TreeView**: Extend anatomy to include tree item text and indicator parts.
- **Clipboard**: Add `api.copy()` to copy text to clipboard

## [0.35.0](./#0.35.0) - 2024-02-11

### Fixed

- **All components**

  - Improve runtime performance when using watchers by subscribing to context once.
  - Fix issue where restoring scroll causes a smooth scroll transition back to the initial scroll point.

- Fix issue where scrolling into view could result in scrolling the body element.

  > Affected components: Select, Menu, Combobox

- **Select**:

  - Fix issue where item group's label id pointed to the wrong element
  - Fix issue where select uses the incorrect id for `aria-activedecesendant` field

- **DatePicker**: Fix issue where date picker does not show correct number of weeks when `startOfWeek` is set

### Added

- **[NEW] Clipboard**: Add Clipboard machine for copying text to clipboard.

- **[NEW] Collapsible**: Add Collapsible machine for interactive component which expands/collapses a panel.

- Add support for open.controlled in the machine context as a way to fully control the machine's open state
  programmatically.

  > Affected components: Dialog, HoverCard, Popover, ColorPicker, DatePicker, Tooltip, Menu, HoverCard, and Combobox.

- **Combobox**: Expose api.collection for better control over the collection of items in combobox.

### Changed

- **DatePicker**
  - [BREAKING] Change date picker from `api.inputProps` to `api.getInputProps(...)` to support multiple inputs.
  - Added a new prop `getPresetTriggerProps` to support custom trigger for common date presets (e.g. Last 7 days, Last
    30 days, etc.)

## [0.34.0](./#0.34.0) - 2024-01-19

### Fixed

- **All components**: Fix issue where positioning doesn't work as expected when combined with entry/exit animations in
  the presence component

### Changed

- **Radio, Tabs**: Make it possible to override indicator's transition duration by setting the `--transition-duration`
  css variable.

## [0.33.2](./#0.33.2) - 2024-01-26

### Fixed

- **React**: Fix context reactivity issue where updates were not sent to the machine

### Added

### Changed

## [0.33.1](./#0.33.1) - 2024-01-26

### Fixed

= **Core**: Fix issue where context mutation updates were missed due to the underlying `proxy-compare` regression.

- **TreeView**: Fix issue where tree view machine types were not exported.

### Added

- **Select**: Add `data-disabled`, `data-invalid`, and `data-readonly` to indicator props

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
