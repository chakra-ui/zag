# CHANGELOG

All notable changes to this project will be documented in this file.

> For v0.x changelog, see the [v0 branch](https://github.com/chakra-ui/zag/blob/v0/CHANGELOG.md)

## [1.47.0](./#1.47.0) - 2026-10-26

### Added

- **Combobox**
  - Announce the result count to screen readers after typing, or "No results" when nothing matches.
  - Add a `loading` prop that sets `aria-busy` on the listbox and holds back "No results" while loading.
  - Add `resultsCount`, `noResults` and `loading` translations. Set one to `""` to turn that announcement off.

  ```tsx
  const service = useMachine(combobox.machine, {
    loading: isFetching,
    translations: {
      resultsCount: (count) => `${count} matches`,
    },
  })
  ```

- **Combobox, Menu**: Add `modifiers` to the `navigate` and `onSelect` details.

  ```tsx
  const service = useMachine(menu.machine, {
    onSelect(details) {
      if (details.modifiers.metaKey) return
    },
  })
  ```

- **Drawer**: Add axis support to `data-no-drag`. Set it to `x` or `y` to block drags only along that axis.

  ```html
  <div data-no-drag="x">Horizontally scrolling content</div>
  ```

- **Steps**: Add `data-current`, `data-complete` and `data-incomplete` to the item, as the styling guide documents.

- **TOC**: Add a `multiple` prop. Set it to `false` to keep only the topmost visible heading active.

  ```tsx
  const service = useMachine(toc.machine, { multiple: false })
  ```

- **Tour**
  - Add `scrollToTargetFn` to customize how a step's target is scrolled into view.
  - Add `data-instant` to the backdrop, spotlight and positioner when they should snap into place instead of animating.

  ```tsx
  const service = useMachine(tour.machine, {
    scrollToTargetFn({ target }) {
      target.scrollIntoView({ behavior: "instant", block: "center" })
    },
  })
  ```

### Fixed

- **Popups**: Fix Escape not closing the content right after it opens.

  > Affected Components: Cascade Select, Color Picker, Combobox, Date Picker, Dialog, Drawer, Hover Card, Menu,
  > Navigation Menu, Popover, Select.

- **Popups**: Fix the trigger missing its focus ring in Firefox after closing with Escape.

  > Affected Components: Cascade Select, Color Picker, Date Picker, Popover, Select.

- **Popups**: Fix floating content flashing at the top-left corner for one frame when it first opens.

- **Carousel**
  - Fix a snap point refresh reverting a page change that hadn't rendered yet.
  - Fix a stale scroll-end timer ending a later scroll early.

- **Cascade Select**
  - Fix the content taking focus after closing right after it opened.
  - Fix leaving an item clearing the next item's grace area early, which could switch the highlighted item.

- **Color Picker**: Fix focus being pulled back to the trigger after closing when focus had moved elsewhere.

- **Combobox**
  - Fix Cmd/Ctrl/Shift/Alt+Enter on link items not opening the link like a modifier-click.
  - Fix announcements not working in modal dialogs.
  - Fix unselected options missing `aria-selected="false"`.
  - Fix `inputBehavior: "autohighlight"` leaving nothing highlighted when the highlighted item is removed.
  - Fix focus being pulled back into the input when tabbing away right after selecting an item.
  - Fix an item staying highlighted after the combobox closes right after opening with the keyboard.

- **Date Input**: Fix focus jumping back into the input after tabbing out of it.

- **Date Picker**
  - Fix Space not selecting the focused date in the calendar.
  - Fix focus being pulled back to the input or trigger after closing when focus had moved elsewhere.

- **Dialog**: Fix focus not returning to the trigger when a non-modal dialog closes.

- **Drawer**
  - Fix focus not returning to the trigger when a non-modal drawer closes.
  - Fix mouse drags that start on the grabber not moving the drawer when the pointer passes over a scrolled list.
  - Fix text in an open drawer not being selectable with the mouse after the pointer moved over it.

- **Editable**
  - Fix cancelling an edit not restoring an empty value, or the initial value when `defaultEdit` is set.
  - Fix a rendered label not naming the input.

- **File Utils**: Fix `getFileMimeType` ignoring uppercase file extensions (e.g. `IMG_0001.HEIC`).

- **Focus Visible**: Fix programmatic focus turning on focus-visible styles when `HTMLElement.prototype.focus` is an
  accessor, as in Storybook 10.0–10.5.

- **Highlight Word**: Fix `exactMatch` for non-ASCII words and for queries that start or end with punctuation (e.g.
  `C++`).

- **Listbox**
  - Fix `ArrowLeft` and `ArrowRight` not being mirrored in grid and horizontal layouts when `dir` is `rtl`.
  - Fix typeahead ignoring the lowercase `a` key.

- **Menu**
  - Fix Cmd/Ctrl/Shift/Alt+Enter on link items not opening the link like a modifier-click.
  - Fix the `aria-label` prop not naming the menu.
  - Fix controlled submenus opening after the pointer leaves their trigger, and controlled context menus opening on a
    short tap.
  - Fix focus being lost after pressing Escape right after an arrow key.

- **Navigation Menu**
  - Fix hovering the same trigger again leaving an earlier open timer running.
  - Fix the content's links dropping out of the Tab order after a quick Tab and Shift+Tab out of the content.

- **Number Input**: Fix scrubbing always incrementing the value when `dir` is `rtl`.

- **Password Input**
  - Remove `aria-expanded` from the visibility trigger.
  - Make the visibility trigger keyboard accessible.

- **Pin Input**
  - Fix screen readers not announcing the label for the inputs.
  - Fix `api.clearValue()` wiping a value set right after it in the same handler.
  - Fix focus jumping back into the inputs when focus moves away right after a paste.

- **Radio Group**: Fix the native radio inputs keeping the old value when the value changes while the group is disabled.

- **Rating Group**
  - Fix `aria-checked` being set on unselected items.
  - Announce half ratings with their actual value.
  - Fix focus being pulled back to the rating when tabbing away right after an arrow key.

- **React, Preact**: Fix controlled prop changes being missed after a hidden `<Activity>` is shown again.

- **Solid**
  - Fix machines missing prop changes made before their first effect run, such as presence staying unmounted while
    `present` is `true`.
  - Fix `watch` missing context changes made by entry actions, such as pin input's `autoFocus` having no effect.

- **Splitter**
  - Fix nested splitters snapping back to their default layout, or flickering, when the outer splitter is resized.
  - Fix `onResizeEnd` reporting a `null` `resizeTriggerId` after dragging or resizing with the keyboard.
  - Fix the resize trigger's `aria-orientation` so it describes the separator, which is perpendicular to the panel
    layout.

- **Steps**: Fix `aria-current="step"` being set on the item wrapper instead of the current step's trigger.

- **Svelte**
  - Fix machines missing prop changes made before their first effect run, such as presence staying unmounted while
    `present` is `true`.
  - Fix component styles being lost on re-render, which left popups in the top-left corner and closed nested menus as
    they opened.
  - Fix `derived_inert` warnings when a machine reads props, `scope` or computed values after its component unmounts.

- **Tabs**: Fix focus jumping back to the tab list when tabbing out right after pressing an arrow, `Home`, or `End` key.

- **Tags Input**
  - Fix characters typed right after a delimiter being cleared along with the new tag's text.
  - Fix a tag staying highlighted after pressing Escape right after deleting the first tag, so a later Delete removed
    it.
  - Fix focus jumping back to the input when focus moves away right after editing a tag.
  - Fix a regex `delimiter` not creating tags while typing when it has flags (e.g. `/\p{P}/u`) or several characters,
    and matching anywhere in the input when it has alternatives.

- **Toast**
  - Fix toasts staying paused after a focused toast is dismissed, or after closing one with the mouse and moving the
    pointer away.
  - Fix new and queued toasts appearing collapsed while the stack is expanded.
  - Fix toast height not updating when its content resizes.
  - Fix swapped offsets when several toasts are created at once in adapters that batch renders (e.g. Vue).

- **TOC**
  - Activate the clicked item right away and keep it active while the page scrolls to it.
  - Activate the section the reader is in when its heading has scrolled out of view, instead of keeping a stale item.
  - Fix `autoScroll` interrupting the smooth scroll to a heading when the TOC sits inside the content's scroll
    container.

- **Toggle Group**
  - Fix `ArrowLeft` and `ArrowRight` not being mirrored when `dir` is `rtl`.
  - Fix focus jumping back into the group when tabbing out right after pressing an arrow, `Home`, or `End` key.

- **Tooltip**
  - Use the `aria-label` prop as the tooltip's accessible description, instead of pointing `aria-describedby` at a
    missing element.
  - Fix the first hover after re-enabling a disabled tooltip not opening it.

- **Tour**
  - Fix focus moving to the page body when the tour is dismissed, skipped or ends because a step target is missing.
  - Fix arrow keys changing steps while typing in an input inside the tour content.
  - Fix the content shifting by half the arrow's size right after a step opens.

- **Tree View**: Fix typeahead ignoring the lowercase `a` key.

- **Vanilla**: Fix `updateProps` slowing down with every call and overflowing the stack in long-lived machines.

- **Vue**: Fix "Maximum recursive updates exceeded" when a nested component, like a submenu, receives an inline object
  prop.

### Changed

- **Combobox**
  - Call `onSelect` when a link item is modifier-clicked. Skip navigating in `onSelect` while a modifier is held.
  - Scroll the list back to the top when the input changes while open.

- **Live Region**
  - Keep one element per region in the DOM, so announcements from different components no longer drop each other.
  - **Breaking change:** Regions no longer have an `id`. Select them with `[data-live-announcer]` instead of
    `#__live-region__`.

  ```diff
  - document.querySelector("#__live-region__")
  + document.querySelector("[data-live-announcer]")
  ```

- **Menu**: Call `onSelect` and close the menu when Enter is pressed on a link item.

- **Svelte**: Raise the minimum `svelte` peer version to `5.29.0`.

- **Toast**: Move focus to the next toast when a focused toast is dismissed, and back to the previously focused element
  after the last one.

- **Tour**: Use the `dialog` role for the content instead of `alertdialog`.

## [1.46.0](./#1.46.0) - 2026-10-11

### Added

- **Dialog, Drawer**: Expose `api.modal` for conditional backdrop rendering.

  ```tsx
  api.modal && <div {...api.getBackdropProps()} />
  ```

- **Pin Input**
  - Add `Ctrl`/`Cmd` + `ArrowLeft`/`ArrowRight` navigation to the first or last input, respecting RTL.
  - Add `ArrowUp`/`ArrowDown` navigation to the first or last input, matching `Home`/`End`.
  - Add a development warning when `count` doesn't match the number of rendered inputs.

- **Toast**: Allow `toaster.update(id, updater)` to derive updates from the current toast, including queued toasts.

  ```ts
  toaster.update(id, (prev) => ({ duration: (prev.duration ?? 5000) + 1000 }))
  ```

- **TOC**: Add `getNavProps()` so the root can wrap page content separately from the navigation.

  ```tsx
  <div {...api.getRootProps()}>
    <nav {...api.getNavProps()}>...</nav>
  </div>
  ```

### Fixed

- **Aria Hidden**: Keep nested dialogs, drawers, modal popovers, and other popups accessible to screen readers when
  their portals mount before the parent modal opens.

- **Carousel**: Prevent slide content or size changes from interrupting dragging or smooth scrolling.

- **Checkbox**: Initialize the hidden input's indeterminate state when `checked` or `defaultChecked` is
  `"indeterminate"`.

- **Color Picker**: Fix `api.setFormat` not changing the format or calling `onFormatChange`.

- **Date Picker**
  - Label the calendar grid with the visible month in the picker's locale.
  - Remove the English-only `aria-roledescription` from the content and table parts.
  - Apply `translations.placeholder` to the input.

- **Focus Visible**: Keep `HTMLElement.prototype.focus` writable when another tool, such as Storybook, defines it as an
  accessor.

- **Nested Popups**: Fix nested popups rendering behind their parent when using `--layer-index` with `lazyMount` or
  `unmountOnExit`. Preserve layer order during exit animations.

  > Affected Components: Cascade Select, Color Picker, Combobox, Hover Card, Menu, Popover, Select.

- **Pagination**: Omit `href` and mark unavailable first, previous, next, and last triggers as disabled when
  `type="link"`.

- **Pin Input**: Run native form validation on Enter, including incomplete values. Focus a visible input when validation
  fails.

- **Popover**: Fix missing `aria-labelledby` and `aria-describedby` on lazily mounted content.

- **Scroll Area**: Apply `data-dragging` only to the scrollbar and thumb being dragged.

- **Solid**: Fix stale values in consecutive state updates inside `batch()`.

- **Splitter**: Call `onCollapse` and `onExpand` on the first collapse or expand after mounting.

- **Toast**
  - Apply updates, dismissal, and removal to queued toasts.
  - Prevent dismissed promise toasts from reappearing when the promise settles.
  - Keep timers paused when creating or updating toasts.
  - Preserve toast updates made inside subscription callbacks.
  - Keep `aria-labelledby` and `aria-describedby` in sync as titles and descriptions mount or unmount.

- **Tooltip**: Preserve the next tooltip's open delay when an open tooltip unmounts.

- **Tour**: Use visible labels as action triggers' accessible names. Use `attrs: { "aria-label": ... }` to label
  icon-only actions.

- **Tree View**: Focus the rename input when pressing `F2` in adapters such as Vue.

### Changed

- **TOC**: Move `aria-labelledby` from `getRootProps()` to `getNavProps()`. Apply `getNavProps()` to the navigation
  element to keep its accessible name.

## [1.45.0](./#1.45.0) - 2026-10-05

### Added

- **Initial Focus**: `initialFocusEl` can now return `false` to open without moving focus. Returning `null` still uses
  the default.

  ```jsx
  const service = useMachine(dialog.machine, {
    initialFocusEl: () => false,
  })
  ```

  > Affected Components: Color Picker, Dialog, Drawer, Floating Panel, Popover.

- **Image Cropper**: Add `api.setCrop(rect)` to place the crop area programmatically, in viewport coordinates. The rect
  is constrained like `initialCrop`, and unlike `api.reset()` it keeps the current zoom, rotation, flip, and pan.

- **Pagination**: Add `api.type` and `api.getPageUrl(page)`, so custom components can tell whether the controls are
  buttons or links and build a page's URL without re-reading the machine props.

  ```jsx
  api.type // "button" | "link"
  api.getPageUrl(3) // "/page/3", or `undefined` when `getPageUrl` is not provided
  ```

### Fixed

- **Carousel**: Fix `allowMouseDrag` advancing a full page per pointer move in Vue.

- **Floating Panel**
  - Fix `strategy: "absolute"` placing the panel outside its boundary. Absolute panels are now positioned against their
    offset parent and clipped by a scrolling boundary.
  - Fix the panel not following its boundary element when an ancestor scrolls.

- **Focus Visible**: Fix `Illegal invocation` thrown during setup when another tool has replaced
  `HTMLElement.prototype.focus` with an accessor.

- **Hotkeys**: Fix an unhandled `TypeError` when a `keyup` event without a valid `key` reaches `document`.

- **Image Cropper**: Fix `Alt+Arrow` resizing ignoring `aspectRatio` and `cropShape: "circle"`.

- **Listbox**: Fix range selection anchoring on the highlighted item instead of the one you clicked.
  - Shift+click with `highlightOnHover` now selects the full range.
  - Successive shift+clicks extend from the originally clicked item, so a range can shrink as well as grow.
  - Shift+arrow can reverse direction without leaving items behind.

- **Merge Props**: Fix inline style values containing semicolons being truncated, such as quoted CSS custom properties
  and data URLs.

- **Popover**: Fix `autoFocus={false}` being ignored for modal popovers.

- **Popper**: Fix popper-based components ignoring a stylesheet `z-index` on the positioner when the content has no
  stacking level.

- **Presence**: Fix an element with an exit animation staying mounted forever in WebKit, invisible but still
  intercepting clicks.

- **Progress**: Fix the formatter not updating when `formatOptions` changes to a subset of the previous options.

- **Splitter**: Fix slow dragging in large documents. The global cursor style is now only written when the cursor
  changes.

- **Svelte**: Fix `derived_inert` warnings when deferred machine cleanup runs after a component unmounts.

- **Tabs**: Fix programmatic tab selection triggering link navigation. Keyboard link activation now bubbles and can be
  canceled by your click handlers.

- **TOC**: Fix `onActiveChange` reporting the previous `activeIds` and `activeItems`, which kept a controlled TOC stuck
  on the old section.

- **Tour**
  - Fix the step card, spotlight and backdrop collapsing into the top-left corner when the step's target element is
    replaced.
  - Fix the backdrop leaving part of the page undimmed on resize or when content loads in. The spotlight now only
    animates between steps.
  - Fix tours in an iframe or custom root measuring the outer page, and crashing on mount without `visualViewport` (e.g.
    jsdom).

## [1.44.0](./#1.44.0) - 2026-09-12

### Added

- **Date Picker**: Add `data-invalid` to label and control so they can be styled when `invalid`.

- **DOM Query**: Add `getCaretPosition` for anchoring a popup, like a mention menu, to the caret.

- **Hotkeys**: Export `getPlatform` and `SequenceStep` type.

### Fixed

- **Color Picker**: Fix screen readers offering the color area and channel slider thumbs as adjustable when disabled.

- **Date Picker**
  - Fix every year cell rendering as disabled outside the decade in view, even with no `min` or `max` set. Selectability
    is `min`/`max` only now; outside cells keep `data-outside-range`.
  - Fix `End` in the year view moving focus two years past the last cell.

- **Dismissable**: Fix popups closing themselves the instant they open when their content is kept mounted and
  re-parented on open. `whenNode`'s `defer: true` now always waits for the commit.

- **File Upload**: Prevent large folder uploads from freezing the tab. Processing 50,000 files now takes milliseconds.

- **Focus Visible**: Fix a programmatic click leaving `:focus-visible` styling in place. Same-position pointer moves are
  now ignored only for trusted events, so synthetic clicks restore pointer modality.

- **General**: Fix `api.setOpen` applying only the first of several calls made in the same tick, so opening then closing
  from one handler left the component open. The last call now wins, as it does for Drawer's `api.setSnapPoint`.

- **Menu**: Fix `onSelect` reporting the highlighted item rather than the one clicked, so clicking while another item
  was highlighted selected the wrong value.

- **Pin Input**: Fix `Ctrl/Meta+X` not cutting on non-React frameworks. Deletion is no longer treated as an invalid
  typed character, so cutting shifts the remaining digits.

- **Vanilla**: Fix `spreadProps` replacing the whole `style` attribute, wiping inline styles set by other code like the
  layer stack's `--layer-index` or popper's `--x`/`--y`.

### Changed

- **Date Utils**: `getDecadeRange` no longer accepts `{ strict }` and always returns ten years, not twelve. Drop the
  option if you passed `{ strict: true }`; the twelve-year form is gone.

- **Vanilla**: `normalizeProps` and `mergeProps` now return `style` as an object, not a CSS string, and `spreadProps`
  applies it per property. Use `toStyleString` for the string form.

## [1.43.3](./#1.43.3) - 2026-08-20

### Fixed

- Fix the exported `Partial` type shadowing TypeScript's built-in `Partial` and breaking `@vue/compiler-sfc` on
  `interface X extends Partial<Y>`.

  Optional properties are now written explicitly as `?: T | undefined`, so types like `IntlTranslations` and
  `ElementIds` are plain interfaces. Passing a single translation key still works.

## [1.43.2](./#1.43.2) - 2026-08-20

### Added

- **File Upload**: Add `data-invalid` to the label props so you can style the label when the file upload is invalid.

- **Hotkeys**
  - Add `target` option to scope a command to a DOM subtree. Pass an element or a function returning one, and the
    command only fires for events inside it. Targeted commands win over global ones on the same hotkey, and the same
    hotkey on different targets is no longer a conflict.

    ```ts
    store.register({
      id: "grid.down",
      hotkey: "ArrowDown",
      action: moveDown,
      options: { target: () => gridEl },
    })
    ```

  - Add `normalizeHotkey`, which resolves equivalent hotkeys (`mod+k`, `Meta+K`) to one canonical string.
  - Add Linux detection. `formatHotkey` now shows `Meta` as `Super` on Linux instead of `Win`.
  - Export the `Platform` type.

- **Presence**: Add `onEnterComplete`, called when the enter animation finishes. Without an enter animation, it fires on
  the next frame after mount. It doesn't fire on the initial render.

### Fixed

- **Hotkeys**
  - Fix `isPressed` returning `false` for bare modifiers like `"shift"` or `"mod"`.
  - Fix commands registered with `enabled: false` never firing, even after `enable()` or `setEnabled(id, true)`.
  - Fix `subscribe` not reporting `pressedKeys` until at least one command was registered.
  - Fix commands with `capture: false` never firing if the store was already listening.
  - Fix `HotkeyRecorder.stop()` clearing the previous value when nothing new was recorded.
  - Fix `HotkeyRecorder.cancel()` keeping a partial recording instead of restoring the previous value.
  - Fix `addScope`, `removeScope` and `toggleScope` not resetting in-progress sequences like `setScope` does.
  - Fix `formatHotkey("meta+K")` showing `Win` instead of `Super` on Linux. Android still shows `Win`.

- **Scroll Snap**: Fix `findSnapPoint` returning wrong positions for `center` and `end` aligned items and in RTL, which
  broke carousel page detection.

- **Translations**: Fix `translations` requiring every message. Override one message and the rest fall back to the
  defaults. `@zag-js/types` now exports a `Partial` compatible with `exactOptionalPropertyTypes`. Affects Carousel, Date
  Input, Date Picker, Editable, Floating Panel, Image Cropper, Marquee, Pin Input, Progress, Rating Group, Signature
  Pad, and Tags Input.

## [1.43.1](./#1.43.1) - 2026-08-16

### Fixed

- **Auto Resize**: Prevent XSS in `autoResizeInput()` by measuring input text with `textContent` instead of parsing it
  as HTML.

- **Cascade Select, Listbox**: Preserve keyboard highlighting when scrolling moves content beneath a stationary pointer.
  Applies to `highlightOnHover` in Listbox and `highlightTrigger: "hover"` in Cascade Select.

- **Combobox, Menu, Select**: Preserve keyboard highlighting when scrolling moves content beneath a stationary pointer,
  including in Safari.

- **Core**: Fix `getExitEnterStates()` throwing during state transitions in browsers without `Array.prototype.at()`,
  such as Safari below 15.4.

- **Date Picker**
  - Allow individual `translations` overrides with `Partial<IntlTranslations>`; omitted messages use defaults.
  - Label the view trigger with the actual next view through `translations.viewTrigger`. Disable it when no further view
    is available.
  - Fix `translations.dayCell()` announcing the generic "Choose" label for dates between a selected range's start and
    end. It now announces "In range".

- **Dismissable**: Handle `Escape` immediately after a dialog, popover, or menu mounts, including under CPU load.

- **Drawer, Navigation Menu, Steps, Tour**: Add `type="button"` to `getTriggerProps()` (steps, navigation-menu) and
  `getCloseTriggerProps()` (drawer, tour). Without it these buttons defaulted to `type="submit"` and submitted an
  ancestor form on click.

- **Floating Panel**
  - Fix closing a panel not removing it from the stack, so the next panel now becomes topmost.
  - Fix stack order not applying to the positioner, so focusing a panel raises it above its siblings.

- **Focus Visible**
  - Fix the interaction modality being reported as `pointer` when content scrolls under a resting cursor. Safari emits
    move events at an unchanged position in that case.
  - Fix `trackFocusVisible()` classifying pointer focus as virtual when activating a label briefly moves focus to an
    overlay container. Clicking a checkbox, radio or switch label added `data-focus-visible` to the control.

- **Image Cropper**: Keep fixed crop selections focusable and support `+`/`-` zoom shortcuts. Arrow keys pan the image;
  `Alt+Arrow` does nothing in fixed mode.

- **QR Code**: Include the rendered overlay in `getDataUrl()` and in the file produced by `getDownloadTriggerProps()`.
  The export previously contained only the QR matrix, so a logo or badge placed over the code was dropped.

- **Splitter**: Fix the element from `getResizeTriggerProps()` matching `:focus-visible` after a pointer drag. It still
  takes focus, so keyboard resizing keeps working, but no longer shows the focus ring.

## [1.43.0](./#1.43.0) - 2026-07-28

### Added

- **Dialog, Drawer**: Add `data-autofocus` and `data-no-autofocus` to control which element gets focus on open. Mark
  chrome controls like the close button with `data-no-autofocus` to skip them, or mark the real target with
  `data-autofocus`.

  ```jsx
  <div {...api.getContentProps()}>
    {/* skipped on open, still in tab order */}
    <button {...api.getCloseTriggerProps()} data-no-autofocus>
      Close
    </button>
    <button data-no-autofocus aria-label="Help">
      ?
    </button>

    {/* receives initial focus */}
    <input data-autofocus />
    <button>Save</button>
  </div>
  ```

  Priority: `initialFocusEl` → `[data-autofocus]` → first tabbable without `[data-no-autofocus]` → content root.

- **Focus Trap**: Add a `persistentElements` option to declare portalled content as part of the trap when it isn't
  reachable via `aria-controls`/`aria-expanded`.

- **Image Cropper**: Add exact natural-image `corners` and `outputSize` to `getCropData()`, plus a `maxSize` option to
  limit `getCroppedImage()` output dimensions.

- **Popper**: Add an `applyStyles` option to control whether computed position styles are written directly to the DOM.

### Fixed

- **Auto Resize**: Prevent programmatic updates to a controlled textarea's `value` from dispatching synthetic `input`
  events and disrupting controlled state.

- **Color Picker**: Prevent `Enter` from committing a partial channel value during IME composition.

- **Date Input**
  - Keep segment text in sync when typing over a committed date.
  - Fix in-progress edits being discarded while focus catches up after auto-advance. Fast typing and
    `ArrowUp`/`ArrowDown`/`Home`/`End` now apply to the active segment.

- **Date Picker**
  - Ignore cell clicks, clear actions, and presets when disabled or read-only. Read-only pickers keep roving-focus
    navigation. Disabled pickers are out of the tab order.
  - Respect `minView`, `maxView`, and `defaultView` when resolving the initial view.
  - Respect controlled `open` over `defaultOpen` during initialization.
  - Enforce `maxSelectedDates` on month and year cells in `multiple` selection mode.
  - Align keyboard range selection with pointer selection. Selecting a third date now restarts the range, and the hover
    preview updates for `Enter`, `Home`, `End`, and `PageUp`/`PageDown`.
  - Resume incomplete range selection when reopening the calendar.

- **Drawer**: Prevent backdrop flicker when closing with an asynchronous controlled `open` setter.

- **Focus Trap**
  - Avoid stealing focus from an element focused by the app during deactivation, such as a newly opened dialog.
  - Prevent nested trap deactivation from throwing when the outer trap has no connected focusable element.
  - Restore the focus ring after keyboard deactivation, such as `Escape`, using `focusVisible: true`.

- **Frameworks**
  - Prefer controlled `value` over `defaultValue` in Vue and Svelte, matching React and Solid.
  - Skip machine exit actions in Solid and Svelte when disposed before startup.

- **Image Cropper**: Fix `getCroppedImage()` and `getCropData()` returning a different region from the visible crop
  after rotating or flipping the image.

- **Marquee**: Keep the configured `speed` consistent across content widths, including content smaller than the
  viewport.

- **Popover**: Fix Tab looping back into portalled content when the trigger is the last tabbable element. Resume
  navigation after the trigger.

- **React**: Keep `useMachine`'s `send`, `prop`, `context`, `computed`, `refs`, and `getStatus` references stable for
  use in effect dependencies.

- **Remove Scroll**: Lock `<html>` when it is the page's scroll container.

- **Signature Pad**: Keep in-progress strokes in `onDraw.currentPath` until drawing ends, preventing controlled `paths`
  from going out of sync.

- **Solid**: Treat `value: null` as controlled instead of falling back to internal state.

- **Splitter**
  - Size collapsed panels to `collapsedSize` instead of `minSize`.
  - Keep keyboard resizing working when a hovered resize trigger receives focus.

- **Tour**
  - Run cleanup and report `completed` when dismissing a tour from a step's `effect`.
  - Preserve tooltip step positioning while the tour closes.
  - Fix `action: "skip"` not skipping the step.

## [1.42.0](./#1.42.0) - 2026-06-29

### Added

- **Number Input**: Add `largeStep` (defaults to `10 * step`, applied on `Shift`) and `smallStep` (defaults to
  `step / 10`, applied on `Alt`) props for configurable keyboard stepping. The defaults preserve the previous stepping
  magnitudes.

- **Slider**: Add `largeStep` prop (defaults to `10 * step`), applied on `Shift` or `PageUp`/`PageDown`. The default
  preserves the previous stepping magnitude.

### Fixed

- **Cascade Select**: Select the highlighted leaf node on `Enter` in non-React frameworks.

- **Date Input**
  - Allow typing dates using the locale's native numerals (e.g. Arabic-Indic `٠-٩`, Devanagari `०-९`) in addition to
    ASCII digits. Latin-locale behavior is unchanged.
  - Preserve `CalendarDate` and `CalendarDateTime` values when using a custom `formatter` without an explicit
    `timeZone`. Use the formatter's resolved time zone instead of shifting by the viewer's UTC offset.

- **Date Picker**
  - Allow typing dates using the locale's native numerals (e.g. Arabic-Indic `٠-٩`, Devanagari `०-९`) in addition to
    ASCII digits.
  - Add date reordering on blur for range selection to match other selection paths.
  - Fix day view briefly flashing when closing the date picker from the month or year view.
  - Fix `visibleRangeText` returning a stale value when multiple date pickers with different `selectionMode` (or
    `timeZone`) share the same visible range. This previously surfaced as SSR hydration mismatches.

- **Menu**: Prevent context menus from flashing at the top-left corner and position long-press menus at the touch point.

- **Number Input**
  - Fix `api.setValue(number)` throwing when `formatOptions` is defined.
  - Fix `Cmd`/`Ctrl` + arrow keys producing values off the `step` grid (e.g. non-integer values when `step: 1`).

- **Slider**: Fix `Cmd`/`Ctrl` + arrow keys producing values off the `step` grid (e.g. non-integer values when
  `step: 1`).

- **Tags Input**: Fix native form submit so `FormData` reflects the current tags. The hidden input previously kept its
  initial value after tags were added, removed, or cleared.

- **Toast**: Fix toast height measurement including the `scale` transform in overlap mode, causing a height flicker when
  expanding the stack. Height is now measured from the untransformed element.

## [1.41.2](./#1.41.2) - 2026-06-05

### Fixed

- **Date Input**: Fix date segment placeholders for locales with explicit script subtags.

- **Drawer**
  - Fix controlled drawer flickering when swiped or backdrop-closed while the `open` setter is asynchronous (e.g.
    history API or a delayed state update).
  - Keep nested-drawer layout metrics in machine state so swipe and backdrop-close transitions stay visually stable.

- **Image Cropper**: Fix `getCroppedImage` and `getCropData` returning the wrong region when the image is displayed at a
  size different from its natural resolution (e.g. `width/height: 100%`).

- **Pin Input**: Apply `data-filled` only to filled inputs on initial render.

- **Signature Pad**: Forward `dir` to the DOM.

## [1.41.1](./#1.41.1) - 2026-05-26

### Fixed

- **Dismissable**: Fix layer `pointer-events` being wiped by frameworks (Svelte, Vue) whose spread updates rewrite the
  entire `style` attribute.

- **Drawer**
  - Fix controlled drawers snapping back to open before the close animation when dismissed via swipe.
  - Fix indent and indent-background snapping back into place after the close animation instead of transitioning in
    sync.
  - Fix `--drawer-swipe-progress` jumping to `1` at the start of a dismiss swipe; it now goes smoothly from `0` (at
    rest) to `1` (fully dismissed).
  - Fix drawer freezing mid-drag on release when its content mounts lazily which left snap points unmeasured.

## [1.41.0](./#1.41.0) - 2026-05-22

### Added

- **Floating Components**: Add `data-side` to placement-aware parts based on the current placement.

  > Affected Components: Cascade Select, Color Picker, Combobox, Date Picker, Hover Card, Menu, Popover, Select,
  > Tooltip, Tour.

- **Date Input**
  - Add `hideTimeZone` prop. The `timeZoneName` segment now renders automatically when the value is a `ZonedDateTime`,
    and can be hidden via `hideTimeZone: true`.
  - Arrow navigation and auto-advance after typing now reach read-only focusable segments (e.g. `timeZoneName`). Typing
    the final editable segment (e.g. "P" on `dayPeriod`) advances focus to the trailing read-only segment instead of
    staying put.

- **Splitter**
  - Add CSS unit support for `defaultSize`, `minSize`, and `maxSize`. The splitter now accepts `px`, `em`, `rem`, `vh`,
    and `vw` in addition to percentages, and resolves them to percentages after hydration.

  ```tsx
  const service = useMachine(splitter.machine, {
    panels: [
      { id: "nav", minSize: "240px", maxSize: "480px" },
      { id: "main", minSize: 30 },
    ],
    defaultSize: ["240px", "60vw"],
  })
  ```

  - Add `resizeBehavior` per panel. Set to `"preserve-pixel-size"` to keep a panel's pixel size constant when the parent
    splitter group resizes. Leave at least one panel as `"preserve-relative-size"` (the default) so the layout can
    absorb the change.

  ```tsx
  panels: [
    { id: "nav", minSize: 20 },
    {
      id: "main",
      minSize: "240px",
      maxSize: "480px",
      resizeBehavior: "preserve-pixel-size",
    },
    { id: "aside", minSize: 20 },
  ]
  ```

  - Allow non-panel children inside the splitter root for fixed toolbars, rails, or status areas that should not be
    managed as panels. Use partial trigger ids (`"left:"`, `":right"`) to bind handles around the fixed element.

  ```tsx
  <div {...api.getRootProps()}>
    <div {...api.getPanelProps({ id: "left" })}>Left</div>
    <div {...api.getResizeTriggerProps({ id: "left:" })} />
    <div style={{ flex: "0 0 180px" }}>Fixed sized element</div>
    <div {...api.getResizeTriggerProps({ id: ":right" })} />
    <div {...api.getPanelProps({ id: "right" })}>Right</div>
  </div>
  ```

- **TOC**: Add `api.scrollTo(value, details?)` for programmatically scrolling to a heading. The optional
  `details.behavior` controls the scroll behavior; when omitted, the platform default applies.

  ```tsx
  api.scrollTo("installation", { behavior: "smooth" })
  ```

### Fixed

- **Accordion**: Remove redundant `aria-disabled` from accordion item triggers.

- **Color Picker**: Invoke `onValueChangeEnd` when the user picks a color with the EyeDropper API, consistent with
  ending a drag on the area or channel sliders.

- **Combobox**: Fix `Enter` no longer submits the form when an item is highlighted (regardless of `allowCustomValue`),
  or when the typed value will be rejected by `allowCustomValue: false`.

- **Date Input**
  - Fix min/max handling to preserve entered segments while editing. Values are now clamped segment-by-segment on blur,
    so `06/15/1999` with min `2000-01-01` becomes `06/15/2000` instead of snapping to `01/01/2000`.
  - Fix range mode keyboard navigation so `ArrowRight` moves from the last segment of the start date to the first
    segment of the end date.
  - Fix time-only formatters (no `year` segment) never firing `onValueChange` — `era` is now only required when `year`
    is present.
  - Use the latest `IncompleteDate` when checking whether `setSegmentValue` can commit.
  - Keep AM/PM arrow navigation in sync when `hourCycle` changes, preserving in-progress edits.
  - Update the visible AM/PM segment when typing "A" or "P".

- **Date Picker**
  - Fix `VALUE.CLEAR` not resetting `activeIndex` and `hoveredValue` in range mode when `getInputProps` inputs are not
    rendered.
  - Allow date entry in locales with multi-character separators (e.g. `cs-CZ`, `sk-SK`, `hu-HU`, `ko-KR` which use
    `". "`).
  - Allow native month/year `<select>` interaction inside modal dialogs in Firefox.
  - Fix range selection with `outsideDaySelectable`: hovering outside-month days no longer changes the visible month;
    hover preview for the end date still updates.

- **Dialog, Drawer, Hover Card, Menu, Popover, Tooltip**
  - Fix custom trigger elements (via `ids.trigger`) being ignored when shared across components (e.g. wrapping a
    `Popover.Trigger` in a `Tooltip` with the same id), causing broken positioning and a close-then-reopen cycle on
    trigger clicks.
  - Fix trigger element lookups in shadow root.

- **Dismissable**
  - Deduplicate `layerStack.add()` by DOM node so the same element is not registered twice (e.g. React Strict Mode).
    Fixes incorrect `data-has-nested`, `--layer-index`, and `--nested-layer-count` on a single open dialog.
  - Fix crash (`Cannot read properties of null (reading 'style')`) when a pointer-blocking dialog or popover closes
    during SPA route teardown.

- **Frameworks**: Fix dialog, drawer, and popover leaving `<body>` uninteractive (`data-scroll-lock`, `data-inert`,
  `overflow: hidden`, `pointer-events: none`) after closing under React 19 Strict Mode.

- **Number Input**: Fix inconsistent blur behavior when the input is cleared and `min` is greater than `0`.

- **Popper**
  - Fix `flip`, `shift`, and `hide` middleware ignoring a late-mounted `boundary`. The boundary is now re-resolved on
    every `computePosition` tick, so a function-form `boundary: () => element` picks up the element once it mounts.
  - Forward `boundary` into the `size` middleware so available width/height match `flip`/`shift`, with per-tick
    resolution for function boundaries.

- **Preact**: Avoid bundling `@zag-js/utils` and remove unused `proxy-compare`.

- **Remove Scroll**: Fix scroll lock leaking on `<body>` (`data-scroll-lock`, `overflow: hidden`) when nested dialogs or
  React Strict Mode trigger overlapping locks.

- **Splitter**
  - Fix clicking a `ResizeTrigger` not moving focus to it, which prevented arrow keys from resizing the splitter until
    it was tab-focused (notably on Safari).
  - Fix `data-focus` being applied on hover by only setting it when the trigger is actually focused.

- **Tabs**: Observe the tab list with `ResizeObserver` so the indicator rect updates when the list resizes without
  individual tab triggers changing size (e.g. responsive grid reflow).

### Changed

- **TOC**: Rename `getScrollEl` context prop to `scrollEl` for consistency with other machines (e.g. `initialFocusEl`,
  `finalFocusEl`).

## [1.40.0](./#1.40.0) - 2026-04-07

### Added

- **Popover**: Add `finalFocusEl` and `restoreFocus` props to control focus behavior when the popover closes.
  - `finalFocusEl`: specify an element to receive focus instead of the trigger
  - `restoreFocus`: set to `false` to prevent focus from returning to the trigger (default `true`)

  Both work in modal and non-modal modes.

### Fixed

- **Color Picker**: Fix color value to respect the specified `format` when setting values via props or `setValue`.
  Previously, the internal color object could retain a mismatched format (e.g., RGB when `format` is `hsla`), causing
  inconsistent `value` objects in `onValueChange` callbacks.

- **Date Input**: Defer min/max constraint until segment is fully typed or on blur to prevent resetting other segments
  mid-keystroke.

- **Date Picker**: Compare time components in `isDateEqual` so editing `CalendarDateTime` or `ZonedDateTime` time
  segments calls `onValueChange`.

- **Navigation Menu**: Remove aggressive and redundant default `aria-label`.

- **Vanilla**: Do not use `{}` instead of `undefined` and `null` computed value (fixes `accept="[object Object]"` in
  File Upload with `accept: undefined`).

### Changed

- **Date Utils**: Remove unsupported `"month"` and `"year"` values from `DateGranularity` type.

## [1.39.1](./#1.39.1) - 2026-04-05

### Added

- **Floating Panel**: Add `initialFocusEl`, `finalFocusEl`, and `restoreFocus` props for focus management when the panel
  opens or closes.

### Fixed

- **Accordion**: Fix missing `data-focus` attribute on `getItemTriggerProps`. This makes the trigger consistent with
  other accordion parts (`getItemProps`, `getItemContentProps`, `getItemIndicatorProps`) which already expose
  `data-focus`.

- **Combobox**: Fix VoiceOver not announcing combobox options when navigating with arrow keys. Safari/VoiceOver ignores
  `aria-activedescendant` changes on combobox inputs, so we now use a live region to announce the highlighted item on
  Apple devices.

- **Menu**: Keep the active item highlighted during quick diagonal pointer movement toward an open submenu.

- **Popper**: Fix incorrect positioning when the anchor or floating element changes while the popover is still open
  (e.g. switching between multiple triggers without closing first).

## [1.39.0](./#1.39.0) - 2026-04-02

### Added

- **Dialog, Drawer, Hover Card, Menu, Popover, Tooltip**

  Support multiple triggers. A single component instance can now be shared across multiple trigger elements. Each
  trigger is identified by a `value` passed to `getTriggerProps`:

  ```jsx
  const users = [{ id: 1, name: "Alice Johnson" }]

  const Demo = () => {
    const service = useMachine(dialog.machine, {
      id: useId(),
      onTriggerValueChange({ value }) {
        const user = users.find((u) => u.id === value) ?? null
        setActiveUser(user)
      },
    })

    const api = dialog.connect(service, normalizeProps)

    return (
      <>
        {users.map((user) => (
          <button {...api.getTriggerProps({ value: user.id })}>Edit {user.name}</button>
        ))}
      </>
    )
  }
  ```

  When the component is open and a different trigger is activated, it switches and repositions without closing.
  `aria-expanded` is scoped to the active trigger, and focus returns to the correct trigger on close.

- **Splitter**: Add multi-drag support for nested splitter layouts. When a horizontal and vertical splitter meet at the
  same point (e.g. a grid layout), users can drag the intersection to resize both directions at once.

  Create a shared registry and pass it to each splitter instance:

  ```ts
  // shared across all splitters on the page
  const registry = splitter.registry()

  // horizontal splitter
  const serviceH = useMachine(splitter.machine, { id: "h", registry })

  // vertical splitter (nested inside a panel of the horizontal one)
  const serviceV = useMachine(splitter.machine, { id: "v", orientation: "vertical", registry })
  ```

  The registry automatically detects when resize handles overlap, activates both splitters on drag, and switches the
  cursor to `move` at intersection points.

- **Tags Input**: Add `sanitizeValue` prop to normalize tag values before they are added. This runs on every new tag, so
  you can enforce consistent formatting in one place — strip whitespace, lowercase, remove special characters, etc.
  Defaults to `(v) => v.trim()`.

  ```ts
  const service = useMachine(tagsInput.machine, {
    // normalize emails to lowercase
    sanitizeValue: (v) => v.trim().toLowerCase(),
  })
  ```

- **Toast**: Add priority-based queue system. When the max number of visible toasts is reached, incoming toasts are
  queued and sorted by priority so the most important ones display first.

  Default priorities (1 = highest, 8 = lowest):

  | Type      | With action | Without action |
  | --------- | ----------- | -------------- |
  | `error`   | 1           | 2              |
  | `warning` | 3           | 6              |
  | `loading` | 4           | 5              |
  | `success` | 5           | 7              |
  | `info`    | 6           | 8              |

  Toasts with an action button are bumped higher because they require user interaction. You can override the automatic
  priority by passing a custom `priority` value:

  ```ts
  toaster.create({ type: "info", title: "Heads up", priority: 1 })
  ```

### Fixed

- **Date Input**: Fix crash in non-React frameworks (Vue, Solid, Svelte) where `event.nativeEvent.isComposing` is
  `undefined`. The composing check now uses a framework-agnostic utility that works across all adapters.

- **Splitter**: Fix `onResizeStart` and `onResizeEnd` callbacks to fire for programmatic resizes

- **Tags Input**: Set `enterKeyHint` to `"done"` on the input element so mobile virtual keyboards show a "Done" button
  that triggers tag addition

- **Tree View**: Add `data-checked` and `data-indeterminate` attributes to item and branch control elements for styling
  based on checked state

- **Vue**: Open nested submenus with ArrowRight, including nested Ark UI `Menu.Root` components

## [1.38.2](./#1.38.2) - 2026-03-25

### Fixed

- **Dialog, Drawer**: Avoid setting inline `pointer-events` when modal, letting the dismissable layer manage it instead.

## [1.38.1](./#1.38.1) - 2026-03-25

### Fixed

- **File Upload**: Automatically reject duplicate files with `FILE_EXISTS` error. Previously, uploading the same file
  twice was silently accepted and deleting one duplicate removed all of them.

- **Toast**: Restore `role="region"` on the toast group element. The role was previously removed to reduce screen reader
  landmark noise, but this caused an axe `aria-prohibited-attr` violation since `aria-label` is not permitted on a `div`
  without a valid role.

- **Tour**
  - Fix step navigation events (`next`, `prev`, `setStep`) firing when the tour is inactive, bypassing the `start` flow
  - Fix popper styles not being cleaned up when transitioning from a tooltip step to a dialog/non-tooltip step

### Changed

- **Core**: Validate compound states at machine creation — throw if a state has child states but no `initial`, or if
  `initial` references a nonexistent child.

## [1.38.0](./#1.38.0) - 2026-03-24

### Added

- **Date Picker**
  - Add missing range data attributes (`data-range-start`, `data-range-end`, `data-in-hover-range`,
    `data-hover-range-start`, `data-hover-range-end`) to month and year cell triggers for range picker mode
  - `TableCellState` now includes `firstInRange`, `lastInRange`, `inHoveredRange`, `firstInHoveredRange`,
    `lastInHoveredRange`, and `outsideRange`
  - Range boundary dates now announce "Starting range from {date}" and "Range ending at {date}" for better screen reader
    context

- **Drawer**
  - Add `description` anatomy part with `aria-describedby` support on the content element
  - Add `SwipeArea` part for swipe-to-open gestures from screen edges

    ```tsx
    <div {...api.getSwipeAreaProps()} />
    ```

  - Add `getDescriptionProps()` and `getSwipeAreaProps()` to the connect API
  - Require intentional swipe movement before showing the drawer (no flash on pointer down)
  - Smooth settle animation from release point to fully open position
  - Add cross-axis scroll preservation to prevent drawer drag when scrolling horizontally
  - Add initial focus management for non-modal mode

- **Pin Input**
  - **No more holes**: Delete and Backspace now splice values left instead of leaving empty gaps. Deleting "2" from
    `[1, 2, 3]` yields `[1, 3, ""]` — not `[1, "", 3]`. Cut (`Ctrl+X`) behaves the same way.
  - **Smarter focus management**: Backspace always moves back, click and ArrowRight are clamped to the insertion point,
    same-key skip advances focus, and roving tabIndex treats the entire pin input as a single tab stop
  - **New keyboard shortcuts**: Home/End to jump to first slot or last filled slot, `enterKeyHint` shows "next" on
    intermediate slots and "done" on the last
  - Add `autoSubmit` prop to automatically submit the owning form when all inputs are filled
  - Add `sanitizeValue` prop to sanitize pasted values before validation (e.g. strip dashes from "1-2-3")

### Fixed

- **Date Picker**: Fix inverted year cell `selectable` state that caused years outside the visible decade or min/max
  range to appear selectable

- **Dialog**
  - Set `pointer-events: none` on positioner in non-modal mode so the page stays interactive
  - Add initial focus management for non-modal mode (mirrors popover behavior)
  - Fix `aria-modal` to reflect actual `modal` prop value instead of hardcoded `true`

- **Drawer**: Fix swipe-to-dismiss in controlled mode (`open: true` without `onOpenChange` now blocks dismiss)

- **Floating Panel**: Fix `closeOnEscape` not working when focus is on a child element (e.g., input) inside the panel

- **Focus Trap**: Fix focus trapping when the content has a single effective tab stop, such as a native radio group.
  Handle disconnected `initialFocus` nodes more safely.

- **Interact Outside**: Fix nested popover and select toggling in Safari when focus and pointer events overlap

- **Splitter**: Fix global cursor styles when splitter is used in a shadow root

### Changed

- **Date Picker**: `DayTableCellState.formattedDate` removed — use `valueText` instead (inherited from `TableCellState`)

- **Drawer**: Set `pointer-events: none` on positioner in non-modal mode so the page stays interactive

## [1.37.0](./#1.37.0) - 2026-03-16

### Added

- **Date Input**
  - Add paste support for ISO 8601 date strings
  - Add `api.focus()` method for programmatic focus
  - Add `createCalendar` prop for non-Gregorian calendar systems (e.g., Buddhist, Persian)
  - Add `isDateUnavailable` prop to mark specific dates as invalid

- **TOC**: Add the table of contents component to highlight active headings while scrolling

### Fixed

- **Dialog, Drawer**: Improve focus restoration by preferring the trigger element as a stable fallback return target
  after remount cycles

- **Floating Panel**: Restore the previous position or size on Escape during dragging or resizing in non-React
  frameworks

- **Preact**: Fix Fast Refresh lifecycle edge cases where machine cleanup could hydrate from stale state and skip
  expected effect re-application

- **React**
  - Re-run entry actions after StrictMode remount
  - Fix Fast Refresh lifecycle edge cases where machine cleanup could hydrate from stale state and skip expected effect
    re-application

- **Radio Group**: Fix missing `aria-labelledby` on radio hidden input, ensuring `getByRole('radio', { name: '...' })`
  works in testing tools like Playwright

- **Toast**: Improve toast group accessibility by removing `role="region"` landmark to reduce screen reader noise and
  restructuring `aria-label` for more natural output (e.g., "Notifications, bottom (Alt+T)")

## [1.36.0](./#1.36.0) - 2026-03-11

### Added

- **Clipboard, Navigation Menu, Popover, Select, Timer, Toast, Tree View**: Add `translations` prop for localization of
  hardcoded accessibility labels

- **Listbox**
  - Add `keyboardPriority` to `getInputProps` to control whether input key handling prioritizes text editing or list
    navigation for `Home`/`End` and horizontal arrows in grid collections
  - Add `highlightFirst`, `highlightLast`, `highlightNext`, and `highlightPrevious` to the API for programmatic
    highlight navigation

- **Tags Input**: Add `allowDuplicates` prop to allow duplicate tags

  ```js
  useMachine(tagsInput.machine, {
    allowDuplicates: true,
  })
  ```

### Fixed

- **Carousel**
  - Fix controlled carousel inside dialog jumping or skipping pages
  - Fix carousel navigation inside CSS-transformed containers (e.g., dialogs with open/close animations)
  - Fix scroll position drifting when container layout shifts (e.g., scrollbar removal)

- **Color Picker**: Preserve vertical slider orientation on pointer updates

- **Date Input**: Improve focus management

- **Floating Panel**
  - Fix `open` taking precedence over `defaultOpen` during initialization
  - Fix `api.setPosition` and `api.setSize` to work independently of drag/resize state
  - Fix React `Maximum update depth exceeded` when content uses `ResizeObserver`
  - Fix maximize/minimize restore reverting to `(0, 0)` in controlled mode
  - Fix Escape during drag/resize to cancel and revert to original position/size

- **Menu**: Fix trigger to keep `aria-expanded="false"` when closed

- **Pin Input**: Fix crash when typing the same character in a completed pin input on frameworks that use native `input`
  event (Svelte, Vue, etc.)

- **Radio Group, Tabs**: Fix indicator only animating when value changes, not on initial render or resize

- **Vanilla**: Fix handling of controlled mode

## [1.35.3](./#1.35.3) - 2026-03-02

### Added

- **Date Input**: Add the date input component

### Fixed

- **Carousel**
  - Recalculate page count and snap points as portalled carousel content finishes layout or resizes
  - Keep page and indicators in sync after drag release and scroll settling
  - Handle rapid mixed interactions (drag, wheel, buttons, indicators) more consistently
  - Keep page state valid when `slidesPerPage`, `slidesPerMove`, direction, or orientation change
  - Make `slidesPerMove` (`auto`, `1`, `2`) progression more predictable

- **Combobox**: Improve controlled-mode synchronization and keep callback/item resolution behavior consistent across
  filtered collections

- **Listbox**: Improve controlled-mode synchronization and keep callback/item resolution behavior consistent across
  filtered collections

- **Select**: Improve controlled-mode synchronization and keep callback/item resolution behavior consistent across
  filtered collections

### Changed

- **I18n Utils**: `formatTime` now accepts `amLabel` and `pmLabel` as separate options instead of the previous
  `amPmLabels` object

## [1.35.2](./#1.35.2) - 2026-02-26

### Fixed

- Fix CJS build issues across all packages

## [1.35.1](./#1.35.1) - 2026-02-26

### Added

- **Core**: Support XState-style `#id` transition targets. `#...` targets now resolve by state node `id`, making
  cross-level transitions explicit.

### Fixed

- **Color Picker**: Fix a regression where clicking the color picker trigger while open did not close the popover

- **Docs**: Fix ESM JSON imports for Node loader compatibility. Add `with { type: "json" }` import attributes and set
  build target to `node20.10` so the ESM output works when loaded in `next.config.mjs`, velite, or other Node ESM
  contexts without `ERR_IMPORT_ATTRIBUTE_MISSING`

## [1.35.0](./#1.35.0) - 2026-02-26

### Added

- **Date Picker**
  - Add non-Gregorian calendar support via `createCalendar` prop
    - Support Persian, Buddhist, Islamic, Hebrew, and other calendar systems
    - Month names, year ranges, formatters, and navigation now respect the active calendar
  - Add `data-type` attribute to weekend table header and cell

### Fixed

- **Combobox**: Fix `onValueChange` returning empty `items` array when using controlled value

- **Popover**: Fix nested popover z-index layering by running `trackDismissableElement` before `trackPositioning`

- **Toast**: Fix types to ensure `parent`/`index` are exposed as props and `expand`/`collapse` are exposed on the store

- **Vanilla**: Fix `mergeProps` to ensure the `style` prop is always a string

## [1.34.0](./#1.34.0) - 2026-02-19

### Added

- **Cascade Select**: Add the cascade select component

- **Date Picker**
  - Add `focus` option to `api.clearValue({ focus?: boolean })`
  - Add `api.setTime(time, index?)` for date-time picker support
  - Add `maxSelectedDates` prop to limit the number of selected dates in `multiple` selection mode
  - Add `api.isMaxSelected` to check if the maximum number of dates has been selected
  - Add `openOnClick` prop to open the calendar when clicking the input field (defaults to `false`)
  - Add `showWeekNumbers` support to display an ISO 8601 week number column in the day view

- **Date Utils**: Add `getWeekOfYear` utility for week number calculation

- **Drawer**: Add the drawer component. Replaces the previous `bottom-sheet` implementation and API naming

- **I18n Utils**: Add `formatTime` utility for locale-aware 12h/24h time formatting with optional seconds

- **Popover**: Add `sizeMiddleware` positioning option to optionally disable the size middleware for better scroll
  performance

- **Select**: Add `autoComplete` prop for browser autofill hints (e.g., `"address-level1"` for state fields)

### Fixed

- **Combobox**
  - Fix `aria-selected` being set on highlighted items instead of selected items, improving screen reader announcements
  - Fix `selectedItems` getting out of sync with `value` when controller ignores selection in controlled mode
  - Fix item disabled state not accounting for root-level `disabled` prop

- **Date Picker**
  - Fix `api.selectToday()` sending incorrect value format to state machine
  - Preserve time/timezone when selecting new dates (`CalendarDateTime` and `ZonedDateTime`)
  - Export `DateValue` type locally instead of re-exporting from `@internationalized/date` (v3.10.0+ compatibility)
  - Return focus to the trigger after selecting or clearing a date in trigger-only mode

- **Date Utils**: Fix `constrainValue` stripping time from `CalendarDateTime`/`ZonedDateTime` values

- **Dialog**: Fix unintended outside-click dismissal of non-modal dialogs

- **Listbox**: Fix DOM IDs

- **Number Input**: Respect the explicit `invalid` prop when the value is out of range

- **Popover**: Improve performance by reducing style recalculations when scrolling with heavy content

- **Select**: Update the value when autofill changes the hidden select

- **Svelte**: Fix `state_unsafe_mutation` warning that occurs due to state transition during component teardown

- **Toast**: Fix TypeScript compilation errors when building projects that use `@zag-js/toast`

## [1.33.1](./#1.33.1) - 2026-01-28

### Fixed

- **Date Picker**: Fix `visibleRangeText` to show correct format based on current view (year/month/day)

- **Dismissable**: Keep parent layers open when a nested dialog or popover closes

- **File Upload**: Fix accessibility violations in file upload component
  - Remove invalid `aria-readonly` from dropzone (not valid for `role="button"`)
  - Add `aria-hidden` to hidden input to exclude from accessibility tree

- **Menu**: Fix glitchy submenu behavior when hovering between trigger items quickly

## [1.33.0](./#1.33.0) - 2026-01-24

### Added

- **Scroll Area**: Add overflow CSS variables to the viewport element for creating scroll fade effects:
  - `--scroll-area-overflow-x-start`: Distance from horizontal start edge in pixels
  - `--scroll-area-overflow-x-end`: Distance from horizontal end edge in pixels
  - `--scroll-area-overflow-y-start`: Distance from vertical start edge in pixels
  - `--scroll-area-overflow-y-end`: Distance from vertical end edge in pixels

- **Slider**: Add `thumbCollisionBehavior` prop to control how thumbs behave when they collide during pointer
  interactions:
  - `none` (default): Thumbs cannot move past each other; excess movement is ignored.
  - `push`: Thumbs push each other without restoring their previous positions when dragged back.
  - `swap`: Thumbs swap places when dragged past each other.

- **Steps**: Add validation and skippable step support:
  - `isStepValid(index)`: Block forward navigation when step is invalid (linear mode)
  - `isStepSkippable(index)`: Mark steps as optional, bypassing validation
  - `onStepInvalid({ step, action, targetStep })`: Callback when navigation is blocked
  - `api.isStepValid(index)` / `api.isStepSkippable(index)`: Check step state
  - `itemState.isValid()`: Lazy validation check per step

- **Tags Input**: Add `placeholder` prop that is applied to the input only when there are no tags

- **Tooltip**: Add `data-instant` attribute to tooltip content to indicate when animations should be instant (e.g., when
  switching between tooltips quickly)

### Fixed

- **Auto Resize**: Emit a change event when a controlled textarea is cleared programmatically

- **Collection, Tree View**: Focus the first visible enabled node. Add `skip` to `getFirstNode()`, matching
  `getLastNode()`, to respect collapsed branches.

- **Color Picker, Color Utils**: Fix color not updating in controlled mode when selecting black shades.
  - Fixed equality check to compare actual channel values instead of CSS string output
  - Auto-detect `defaultFormat` from initial color value instead of hardcoding `"rgba"`

- **Floating Panel**: Restore minimized panels when double-clicking the title bar

- **Image Cropper**
  - Fix `reset()` removing the crop area
  - Update the crop immediately when `aspectRatio` or `cropShape` changes
  - Add symmetric resize support when holding `Alt` key during pointer drag
  - Fix panning bounds in fixed crop mode at various zoom levels
  - Fix race condition where initial crop may not compute on page reload

- **Number Input**: Fix cursor positioning when clicking label or after scrubbing. The cursor now moves to the end of
  the input value instead of the start.

- **Pagination**: Disable the next trigger when `count` is `0`

- **Slider**: Account for thumb inset when clicking the track or dragging a thumb from its edge with
  `thumbAlignment="contain"`.

- **Switch**: Fix `api.toggleChecked()`

- **Toast**: Show toasts created before the state machine connects

- **Tour**: Scroll only when the step target isn't visible, using `block: "nearest"` instead of `block: "center"`.

- **Vanilla**
  - Allow machine props to change at runtime
  - Write `aria-*` attributes as string values instead of boolean attributes

## [1.32.0](./#1.32.0) - 2026-01-02

### Added

- **Date Picker**: Add `onVisibleRangeChange` callback to notify when the visible date range changes. This callback
  fires when:
  - Clicking next/prev triggers
  - Selecting a month from the month dropdown
  - Selecting a year from the year dropdown
  - Focusing a date outside the current visible range
  - Any other action that changes the visible range

- **File Upload**
  - Add `readOnly` prop to prevent file modifications while keeping component visually active
  - Add `maxFilesReached` and `remainingFiles` to exposed API

- **Vanilla**: Add the vanilla JavaScript adapter
  - `VanillaMachine` - Class-based wrapper for zag machines with start/stop lifecycle
  - `normalizeProps` - Converts React-style props to vanilla DOM attributes
  - `spreadProps` - Spreads props onto DOM elements with event listener management

  ```typescript
  import { VanillaMachine, normalizeProps, spreadProps } from "@zag-js/vanilla"
  import * as toggle from "@zag-js/toggle"

  const machine = new VanillaMachine(toggle.machine, { id: "toggle" })
  machine.start()

  const api = toggle.connect(machine.service, normalizeProps)
  spreadProps(buttonEl, api.buttonProps)

  machine.stop()
  ```

### Fixed

- **Carousel**: Fix next/previous buttons and indicators in RTL

- **File Upload**
  - Run file transformation and validation in `api.setClipboardFiles`
  - Fix item element IDs to use `name-size` combination for uniqueness (prevents ID collisions with same-named files)

- **Focus Trap**: Fix focus trap crash when clicking labels in dialogs

- **Pin Input**: Prevent `maxlength="1"` from truncating pasted values in Vanilla

- **Tour**: Allow interaction with inputs inside the spotlight target by including the target in the focus trap

## [1.31.1](./#1.31.1) - 2025-12-10

### Fixed

- **Accordion, Menu**: Fix `aria-controls` element lookups for lazily mounted content
- **Rating Group**: Allow keyboard focus when the value is `0`

## [1.31.0](./#1.31.0) - 2025-12-05

### Added

- **Number Input**: Add `onValueCommit` callback that fires when the input loses focus or Enter is pressed

- **Pagination**
  - Add `getFirstTriggerProps()` and `getLastTriggerProps()` methods for navigating to first/last page
  - Add `boundaryCount` parameter for controlling boundary pages (start/end)
  - Implement balanced pagination algorithm for consistent UI elements
  - Maintain visual consistency with max 7 elements regardless of total pages

- **Tree View**: Add `scrollToIndexFn` prop to enable keyboard navigation in virtualized trees

### Fixed

- **Color Picker**
  - Add `role="dialog"` to color picker content when not inline to ensure proper `aria-controls` detection
  - Add `aria-haspopup="dialog"` to color picker trigger when not inline for better accessibility

- **Date Picker**: Update the input format when `locale` changes

- **Listbox**
  - Avoid React's `flushSync was called from inside a lifecycle method` warning when filtering items
  - Apply `data-highlighted` to the first item when filtering with `autoHighlight`

- **Number Input**
  - Sync the input when `formatOptions` changes
  - Preserve cursor position when Enter triggers formatting
  - Fix cursor jumping to start when value is changed externally via props while user is typing

- **Pagination**: Fix ellipsis showing when only 1 page gap

- **Radio Group**
  - Prevent the indicator from appearing before positioning is ready
  - Improve accessibility of radio group by adding `invalid` and `required` props with corresponding `data-*` and
    `aria-*` attributes

- **Tabs**: Prevent the indicator from appearing before positioning is ready

- **Tooltip**: Fix tooltip not showing when scrolling with pointer over trigger

- **Collapsible, Presence, Tour**: Fix machines setting reactive state in exit actions

### Changed

- **Tree View**: Change `getVisibleNodes()` to return `{ node, indexPath }[]` instead of `node[]`. Read each node from
  the `node` property.

  ```tsx
  // Before
  const nodes = api.getVisibleNodes()
  nodes.forEach((node) => console.log(node.id))

  // After
  const visibleNodes = api.getVisibleNodes()
  visibleNodes.forEach(({ node }) => console.log(node.id))
  ```

## [1.30.0](./#1.30.0) - 2025-11-26

### Added

- **Date Picker**
  - Support `required` and `invalid` props
  - Expose `disabled` and `invalid` in the date picker API for better state access

- **Navigation Menu**
  - Add `getItemIndicatorProps` part for indicator styling
  - Add `closeOnClick` prop to `getLinkProps` to control whether the navigation menu closes when a link is clicked
    (defaults to `true`)

### Fixed

- **Floating Panel**
  - Apply `dir` to all floating panel parts
  - Disable double-click resizing when `resizable={false}`
  - Double-click behavior now checks `event.defaultPrevented` to allow users to prevent the default behavior by calling
    `event.preventDefault()`

- **Navigation Menu**
  - Avoid focusing the trigger when hovering over it
  - Separate `ContentProps` from `LinkProps` for `getContentProps` - previously it incorrectly used `LinkProps`

- **Number Input**: Improve controlled usage by ensuring input element stays synced with controlled value

### Changed

- **Navigation Menu**: Removed `getIndicatorTrackProps` - use `getListProps` instead (list now includes
  `position: relative`)

  ```tsx
  // Before
  <div {...api.getIndicatorTrackProps()}>
    <div {...api.getListProps()}>
      {/* items */}
    </div>
  </div>

  // After
  <div {...api.getListProps()}> {/* now acts as indicator track */}
    {/* items */}
  </div>
  ```

## [1.29.1](./#1.29.1) - 2025-11-22

### Fixed

- **Floating Panel**
  - Position the `n` resize trigger at `top: 0`
  - Respect `draggable: false` and `resizable: false`

- **Presence**: Fix regression where UNMOUNT transition might not be called consistently

## [1.29.0](./#1.29.0) - 2025-11-19

### Added

- **Carousel, Color Picker, Combobox, Date Picker, Select**: Add `value` to `OpenChangeDetails` for better context in
  change handlers

- **Splitter**: Add `getResizeTriggerIndicator` to render an indicator when resizing

- **Toast**: Expose viewport offset as CSS variables (`--viewport-offset-left`, `--viewport-offset-right`,
  `--viewport-offset-top`, `--viewport-offset-bottom`) on the toast group element

### Fixed

- **Carousel**: Fix dragging not working after scrolling with mouse wheel when `allowMouseDrag` is enabled

- **Combobox**: Call `onHighlightChange` with `{ highlightedValue: null, highlightedItem: null }` when filtering leaves
  the collection empty

- **File Upload**: Open the file picker when clicking non-interactive dropzone children, such as icons and text

- **Radio Group**: Fix inconsistent application of `data-focus-visible` and `data-focus` attributes

- **Splitter**: Fix disabled splitter showing resize cursor and allowing dragging

## [1.28.0](./#1.28.0) - 2025-11-12

### Added

- **Carousel**: Support `autoSize` prop to allow variable width/height slide items.

### Fixed

- **Carousel**: Restore dragging after switching browser tabs or scrolling the page.

- **Date Picker**: Prevent crashes when entering the end date first and repeatedly blurring the range input.

- **Image Cropper**
  - Fix controlled `zoom` updates
  - Clamp non-fixed crop offsets to the viewport rectangle

- **Presence**: Prevent elements from staying in `unmountSuspended` during rapid hovering

- **Radio Group, Tabs**: Fix indicator prematurely showing when rect has not been resolved yet

- **Store**: Fix "Illegal invocation" errors by excluding native objects with special `this` bindings from being
  proxied.

- **Tabs**: Fix tabs indicator position not updating when inactive tabs change size.

- **Tags Input**: Apply `data-*` attributes to item delete triggers

## [1.27.1](./#1.27.1) - 2025-11-04

### Fixed

- **Combobox**
  - Fix focus stealing in controlled open mode
  - Remove problematic `aria-hidden` behavior to allow interaction with other page elements

- **All Components**: Export missing types across all machine packages

## [1.27.0](./#1.27.0) - 2025-11-01

### Added

- **Dialog, Popover**: Improve support for shadow DOM in interact outside and focus trap detection.

### Fixed

- **Marquee**: Fix Firefox flicker, use margin spacing, add GPU acceleration, and add `item` part.

- **Popover**: Improve support for shadow DOM in interact outside and focus trap detection.

- **Dialog**: Prevent extra gaps and layout shifts when opening with `scrollbar-gutter: stable`.

- **Slider**: Call `onValueChangeEnd` for programmatic changes through `setThumbValue`, `setValue`, `increment`, and
  `decrement`.

## [1.26.5](./#1.26.5) - 2025-10-29

### Fixed

- **Date Picker**: Fix crash in range date picker when typing end date first by adding `null`/`undefined` checks when
  accessing date properties.

- **Image Cropper**
  - Fix the resize API
  - Export missing types
  - Make the image cropper responsive

- **Radio Group**: Revert to using `offsetLeft`/`offsetTop` to fix indicator positioning in scrollable containers.

- **Tabs**: Revert to using `offsetLeft`/`offsetTop` to fix indicator positioning in scrollable containers.

- **Tour**
  - Fix step effect cleanup.
  - Fix wait step behavior.
  - Validate the configured steps on mount to ensure they are valid.

## [1.26.4](./#1.26.4) - 2025-10-23

### Added

- **Image Cropper**: Add the image cropper component

- **Marquee**: Add the marquee component for continuously scrolling content

### Fixed

- **Angle Slider**: Prevent value jumps when dragging the thumb from an off-center position. Preserve the initial
  pointer offset throughout the drag.

- **Slider**: Prevent value jumps during dragging by preserving the initial pointer offset.

- **Svelte**: Support conditional classes, arrays, and objects through Svelte's native class handling in `mergeProps`.

- **Toast**: Keep hovered toast stacks expanded when dismissing a toast in Solid.

## [1.26.3](./#1.26.3) - 2025-10-18

### Fixed

- **Angle Slider**: Give the thumb an accessible name through `aria-label`, `aria-labelledby`, or the associated label.

- **Select**: Expose the required state on the trigger.

- **Tags Input**: Add custom tags on the first `Enter` press when the integrated combobox has no highlighted item.

## [1.26.2](./#1.26.2) - 2025-10-14

### Fixed

- **Checkbox**
  - Fix initialization with `checked: "indeterminate"`
  - Report the current `boolean | "indeterminate"` state in `api.checkedState`

- **Collapsible**: Respect the provided `dir` instead of hardcoding `ltr`

- **Combobox**: Sync the initial controlled single-select value to `inputValue`

- **Listbox**: Allow the default Enter action when no item is highlighted

- **Radio Group**: Refactor to use `getBoundingClientRect()` for precise indicator positioning

- **Slider**
  - Prevent thumb dragging from stopping abruptly
  - Prevent range thumbs from getting stuck at the same position when `minStepsBetweenThumbs` is unset

- **Tabs**: Refactor to use `getBoundingClientRect()` for precise indicator positioning

- **Tags Input**: Apply `maxLength` to the edit input

## [1.26.1](./#1.26.1) - 2025-10-08

### Fixed

- **Tree View**
  - Prevent `F2` from locking navigation and selection.
  - Require `canRename` to enable renaming.

## [1.26.0](./#1.26.0) - 2025-10-06

### Added

- **Tree View**: Add inline node renaming (experimental).
  - Press `F2` to start renaming with the current label focused. Press `Enter` or blur to submit, or `Escape` to cancel.
  - Support IME composition and trim labels before passing them to callbacks. Empty or whitespace-only names keep the
    input in rename mode.
  - Use `canRename` to control which nodes can be renamed, `onRenameStart` to track activation, and `onBeforeRename` to
    validate changes.
  - Update the collection in `onRenameComplete`.
  - Style items and branches with `data-renaming`, or read `nodeState.renaming`.

### Fixed

- **Editable**: Restore the input value after repeated full deletion

- **Focus Visible**: Fix `"Cannot assign to read only property 'focus'"` console error by gracefully handling
  environments where `HTMLElement.prototype.focus` is non-configurable.

- **Listbox**: Preserve required prop types in `splitProps` instead of making every prop optional.

- **Presence**: Fix race condition where dialog remains closed when `open` prop rapidly changes from `true` to `false`
  to `true`

- **Solid**: Pass the current event data to transition actions

## [1.25.0](./#1.25.0) - 2025-09-28

### Added

- **Collapsible**: Support `collapsedHeight` and `collapsedWidth` props to control the dimensions of the collapsible
  content when in its collapsed state.

- **Focus Trap**: Include portalled elements referenced by `aria-controls` in the focus trap.

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

- **Slider**: Stop dragging when disabled during a drag.

- **Switch**: Keep `data-active` in sync when `disabled` changes

## [1.24.2](./#1.24.2) - 2025-09-18

### Fixed

- **Date Picker**: Show the hovered range in year range pickers

- **Date Utils**
  - Fix dates returned by quarter presets
  - Show the hovered range in year range pickers

- **I18n Utils**
  - **formatBytes**: Support `unitSystem` property to allow changing between decimal (1000 bytes) and binary (1024
    bytes) systems.

- **Number Input**: Preserve the cursor position while typing with `formatOptions`, such as `style: "currency"`.

- **Pin Input**: Clear inputs with `Cmd+Backspace` and `Cmd+Delete` instead of inserting "undefined".

- **Scroll Area**: Update scrollbars when the root element resizes.

## [1.24.1](./#1.24.1) - 2025-09-14

### Fixed

- **Core**: Allow `null` and `undefined` props in `mergeProps`

## [1.24.0](./#1.24.0) - 2025-09-13

### Added

- **Combobox**: Add `alwaysSubmitOnEnter` to submit the form on the first Enter press instead of closing the combobox
  first.

### Fixed

- **Editable**: Allow text selection in the preview when `autoResize` is enabled.

- **File Upload**: Fix regression where clicking the trigger doesn't open the file picker when used within the dropzone

- **Hover Card**: Change default delay values for hover card to improve accessibility.
  - `openDelay`: from `700ms` to `600ms`

- **Menu**: Open a single tab when keyboard-activating items with `target="_blank"`

- **Svelte**: Fix Svelte warning about state reference capturing initial value instead of current reactive state

- **Tooltip**: Change default delay values for tooltip to improve accessibility.
  [Learn more](https://www.nngroup.com/articles/timing-exposing-content)
  - `openDelay`: from `1000ms` to `400ms`
  - `closeDelay`: from `500ms` to `150ms`

## [1.23.0](./#1.23.0) - 2025-09-11

### Added

- **Dismissable**: Support layer types in dismissable layer stack. Layers can now be categorized as `dialog`, `popover`,
  `menu`, or `listbox`. This enables:
  - `data-nested` attribute on nested layers of the same type
  - `data-has-nested` attribute on parent layers with nested children of the same type
  - `--nested-layer-count` CSS variable indicating the number of nested layers of the same type

### Fixed

- **Core**: Preserve symbol keys in `mergeProps`

- **DOM Query**
  - Respect shadow DOM in `isActiveElement`
  - Return `null` from `getActiveElement` for focusable web components without focusable children

- **Menu**: Avoid scrolling partially visible items into view on pointer hover

- **Tabs**: Allow custom `ids` for `item` and `content`

- **Toast**: Allow creating a toast store without any arguments

  ```tsx
  // before
  const store = toast.createStore({})

  // after
  const store = toast.createStore()
  ```

## [1.22.1](./#1.22.1) - 2025-08-27

### Fixed

- **Collection**: Skip disabled items during typeahead

- **Date Picker**: Clamp out-of-range input values on blur

- **Tags Input**: Clear the highlighted item when tabbing to another button within the `control` part.

## [1.22.0](./#1.22.0) - 2025-08-26

### Added

- **Hover Card**: Support `disabled` prop

### Fixed

- **Color Picker**: Fix RTL interactions

- **Dismissable**: Add `onRequestDismiss` when a parent layer requests dismissal. Call `event.preventDefault()` to keep
  the child layer open.

- **Number Input**
  - Omit the input `pattern` when `formatOptions` is provided. This prevents native pattern validation from conflicting
    with formatted values (e.g., currency or percent).
  - Handle empty values consistently across all format options.
  - Add `data-scrubbing` attribute to the number input parts.

- **Tooltip**
  - Set `closeOnPointerdown` to `false` when `closeOnClick` is set to `false`
  - Reduce bundle size by replacing `@zag-js/store` dependency with a lightweight store implementation.

## [1.21.9](./#1.21.9) - 2025-08-23

### Fixed

- **Async List**
  - Prevent concurrent sort operations from overwriting newer data.
  - Allow `RELOAD`, `FILTER`, and new `SORT` events to interrupt sorting.
  - Add `filterText` to `SortDetails` for local and server-side filtering.

## [1.21.8](./#1.21.8) - 2025-08-22

### Fixed

- **Date Picker**
  - Clear hovered range state after completing range selection instead of waiting for pointer to leave the calendar
    area.
  - Update month and year select labels when `min` or `max` changes.
  - Expose `disabled` on `api.getMonths()` and `api.getYears()` results to indicate options out of range for current
    constraints.

- **Listbox**
  - Highlight the first enabled item on focus when no item is highlighted.
  - Add `getElement` to `scrollToIndexFn` details
  - Track collection changes and clear `highlightedValue` if the item is no longer in the collection.

- **Scroll Area**
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

- **Scroll Area**
  - Fix scrollbar thumb dimensions
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

- **Listbox**: Support navigating grid collections

### Changed

- **Async List**: Improve type inference for descriptors

- **Framework Components**: Improve runtime performance of components by removing refs/events from stateful to
  non-stateful objects (affects Svelte, Solid, and Vue components)

## [1.21.2](./#1.21.2) - 2025-08-13

### Added

- **Scroll Area**: Add the scroll area component

### Fixed

- **Carousel**
  - Update when `slideCount` or `autoplay` changes.
  - Stop autoplay at the last slide when `loop: false`.

- **Date Picker**: Expose `data-inline` attribute on Content part to enable distinct styling for inline date pickers
  versus popover date pickers.

- **Menu**: Call `onCheckedChange` once per checkbox or radio item change

- **Radio Group**: Apply `data-focus-visible` when navigating with arrow keys.

## [1.21.1](./#1.21.1) - 2025-07-31

### Fixed

- **Carousel**: Allow controlled navigation to the last slide

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

- **Date Picker**: Keep the hovered range independent of selected values

- **Tree View**: Scroll tree items into view when content overflows.

## [1.20.0](./#1.20.0) - 2025-07-22

### Fixed

- **Date Picker**: Fix comparisons between `CalendarDate`, `CalendarDateTime`, and `ZonedDateTime`, including their time
  components.

### Added

- **Date Picker**: Add hover range previews with `inHoveredRange`, `firstInHoveredRange`, and `lastInHoveredRange`
  properties to `DayTableCellState` with corresponding data attributes `data-in-hover-range`, `data-hover-range-start`,
  and `data-hover-range-end`.

  Hover range states are only active when not overlapping with actual selected range, enabling distinct styling for
  hover preview vs actual selection in range mode.

## [1.19.0](./#1.19.0) - 2025-07-20

### Added

- **File Upload**: Support programmatically controlling the accepted files via `acceptedFiles` and
  `defaultAcceptedFiles`

- **Signature Pad**: Support programmatically controlling the paths via `paths` and `defaultPaths` props.

## [1.18.5](./#1.18.5) - 2025-07-19

### Added

- **JSON Tree Utils**: Support `groupArraysAfterLength` to truncate large arrays into chunks (reducing the number of DOM
  nodes rendered).

### Fixed

- **General**: Avoid ESLint `unbound-method` warnings when destructuring the API

- **Tree View**: Infer tree node types in `onExpandedChange`, `onSelectionChange`, and `onFocusChange`

- **Popper**: Expose floatingElement to the `updatePosition` function

## [1.18.4](./#1.18.4) - 2025-07-18

### Fixed

- **Collection**: Preserve the children key when `filter` finds no matching children

- **Number Input**: Allow negative decimal values in the default input pattern

## [1.18.3](./#1.18.3) - 2025-07-05

### Fixed

- **Carousel**: Prevent full-page carousels from trapping scrolling

- **File Upload**
  - Validate `api.setFiles` against the current `acceptedFiles`
  - Infer MIME types from file extensions when the browser doesn't provide them during validation.

## [1.18.2](./#1.18.2) - 2025-07-04

### Added

- **Collection**: Add `upsert` to list collection. Useful for making creatable items in select or combobox

### Fixed

- **Date Picker**: Support controlled `focusedValue`
- **Toast**: Accept React or Vue elements in `title` and `description`

## [1.18.1](./#1.18.1) - 2025-07-02

### Fixed

- **Combobox**
  - Expose `reason` to `onOpenChange` and `onInputValueChange` callbacks
  - Select highlighted item only if it exists in the collection
  - Expose `api.clearHighlightedValue` function to clear highlighted value

- **Date Picker**: Prevent errors with `selectionMode="range"` and `minView="year"`

- **Listbox**: Select highlighted item only if it exists in the collection

- **Progress**: Improve `valueAsString` formatting

- **Select**
  - Select highlighted item only if it exists in the collection
  - Expose `api.clearHighlightedValue` function to clear highlighted value

- **Tour**: Allow string step IDs in `StepActionMap.goto`

- **Tree View**: Expose `id` in the tree node state

## [1.18.0](./#1.18.0) - 2025-06-30

### Added

- **Color Picker**: Support `inline` prop to render color picker inline
- **Date Picker**: Support `inline` prop to render the date calendar inline

### Fixed

- **Aria Hidden**: Exclude elements with `role="status"` and `output` elements when applying aria-hidden
- **Color Picker**: Auto-prefix Hex values with `#` if missing when using the `hex` channel input
- **Menu**: Fix interaction outside detection for focusable context trigger
- **Tree View**: Improve support for rendering tree items as links

## [1.17.4](./#1.17.4) - 2025-06-27

### Fixed

- **Combobox, Select, Listbox**: Update `valueAsString` when items load for an existing `defaultValue` or `value`

## [1.17.3](./#1.17.3) - 2025-06-27

### Fixed

- **Tree View**: Fix tree traversal for querying last node

## [1.17.2](./#1.17.2) - 2025-06-26

### Fixed

- **Angle Slider**: Smooth thumb dragging on touch devices

- **Timer**
  - Stop at `targetMs` when the window is hidden
  - Validate `startMs` and `targetMs`
  - Fix `progressPercent` calculation for countdown timers

- **Tree View**: Expose node details in `onExpandChange`, `onSelectionChange` and `onFocusChange`

### Changed

- **Collection**
  - Support `findNodes` to find multiple nodes by value in a single pass
  - Fix `getLastNode` in trees with a single branch

- **I18n Utils**: Add `createCollator` function for locale sensitive string comparison

## [1.17.1](./#1.17.1) - 2025-06-24

### Fixed

- **Date Picker**: Align keyboard and pointer selection of unavailable dates in month view

- **Toast**: Require `loading` in `toaster.promise` and warn when omitted, preventing a crash

- **Tree View**
  - Check child nodes when clicking an indeterminate branch
  - Remove `aria-busy` attribute from branch trigger when not loading children

## [1.17.0](./#1.17.0) - 2025-06-23

### Fixed

- **Progress**: Fix `orientation="vertical"`
- **Progress**: Show the indeterminate state when `defaultValue` is `null`

### Changed

- **Tree View**: Rename `getItemCheckboxProps` to `getNodeCheckboxProps` since it can be used in both items and branches

## [1.16.0](./#1.16.0) - 2025-06-21

### Added

- **Tree View**
  - Support checkbox state for checkbox trees via `defaultCheckedValue`, `checkedValue`, `onCheckedChange` props
  - Add callback for when `loadChildren` fails via `onLoadChildrenError` prop
  - Add `api.getCheckedMap` method to get the checked state of all nodes

- **Tree Collection**: Support `getDescendantNodes` and `getDescendantValues`

### Fixed

- **Tree View**: Allow `api.collapse()` and `api.deselect()` without arguments
- **General**: Add better support for TypeScript's `exactOptionalPropertyTypes` compiler option

## [1.15.7](./#1.15.7) - 2025-06-19

### Fixed

- **Collection**: Avoid adding empty children to leaf nodes during filtering.

## [1.15.6](./#1.15.6) - 2025-06-18

### Fixed

- **General**: Handle pointerdown and click only for the primary button

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

- **Combobox**: Submit forms on the first Enter press when `allowCustomValue: true`

## [1.15.4](./#1.15.4) - 2025-06-16

### Fixed

- **Menu, Combobox**: Fix link item activation in Svelte
- **Toggle Group**: Fix toggle interactions in Svelte when blur events overlap

## [1.15.3](./#1.15.3) - 2025-06-13

### Fixed

- **Popover**: Prevent duplicate `onOpenChange` calls in controlled mode
- **File Utils**: Improve `downloadFile` function to handle webview scenarios
- **Combobox**: Prevent duplicate `onInputValueChange` calls on item selection

## [1.15.2](./#1.15.2) - 2025-06-10

### Fixed

- **Menu**: Refactor `getItemTextProps` and `getItemIndicatorProps` to accept a partial interface of option item.

## [1.15.1](./#1.15.1) - 2025-06-10

### Added

- **Async List**: Add the async list controller
- **Editable**: Support `activationMode=none`
- **Collection**
  - Expose `copy` method
  - Allow `getParentNodes` to accept a value or index path

### Fixed

- **Carousel**: Prevent crashes when `slidesPerPage` is `0`
- **File Upload**: Prevent `undefined` in `acceptedFiles` when no files accepted
- **Select**: Preserve the highlighted item during arrow-key navigation
- **Tabs**: Keep the selected tab unchanged on Cmd-click or middle-click of a tab link

## [1.15.0](./#1.15.0) - 2025-06-05

### Added

- **Tree View**: Support lazy loading node children. To use this, you need to provide:
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
- **Slider**
  - Clamp `Shift` + `ArrowRight` to `max` when the step exceeds the range
  - Report the latest value in `onValueChangeEnd` during fast dragging

## [1.14.0](./#1.14.0) - 2025-05-29

### Added

- **File Upload**: Support transforming uploaded files via `transformFiles` context property.

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

- **Slider**: Respect `minStepsBetweenThumbs` during pointer and keyboard interactions.

## [1.13.1](./#1.13.1) - 2025-05-27

### Fixed

- **Password Input**
  - Export missing types for `Api` and `Service`
  - Add `api.toggleVisible` function to toggle the visibility of the password input
  - Implement `translations` prop to customize the visibility trigger accessibility label

## [1.13.0](./#1.13.0) - 2025-05-26

### Added

- **Password Input**: Add the password input component.
- **Select**: Add `onSelect` callback that gets fired when an item is selected via keyboard/mouse.

### Fixed

- **Color Picker**: Prevent input commits from firing the value change end event.

- **Svelte**: Fix microtask timing in Svelte `5.28.3+`.

- **Toast**: Allow `toast.remove()` without an ID in TypeScript.

## [1.12.4](./#1.12.4) - 2025-05-20

### Fixed

- **Svelte**: Improve reactivity of synchronous state updates.

## [1.12.3](./#1.12.3) - 2025-05-16

### Fixed

- **Carousel**
  - Fix keyboard navigation when the carousel region is focused
  - Restore snapping after dragging with `allowMouseDrag`

- **Combobox**: Call `onInputValueChange` when `autoFocus: true`

- **Focus Visible**: Support environments that prevent assignment to `HTMLElement.prototype`, such as happy-dom

- **Preact**: Remove `react` and `react-dom` from peerDependencies

- **Slider**: Prevent errors when rendered inside a popover or dialog

- **Svelte**: Improve reactivity when events don't trigger a state transition

- **Tour**: Allow starting at a specific step with `api.start(id)`

## [1.12.2](./#1.12.2) - 2025-05-12

### Fixed

- **Select, Menu, Tabs**: Fix type issue with the `navigate` prop

## [1.12.1](./#1.12.1) - 2025-05-12

### Fixed

- **Collection**: Fix `getNextValue` and `getPreviousValue` with grouped items.

- **Combobox**
  - Fix link item activation in Vue
  - Add `href` to params in `navigate` context property

- **Menu, Tabs**: Add `href` to params in `navigate` context property

## [1.12.0](./#1.12.0) - 2025-05-01

### Added

- **Date Picker**: Support `outsideDaySelectable` prop to allow selecting days outside the current month (on the same
  visible date range)

### Fixed

- **Collapsible**: Fix collapse animations in React 18 and earlier

## [1.11.0](./#1.11.0) - 2025-04-20

### Added

- **ListCollection**: Support grouping collection items

### Fixed

- **Listbox**: Export missing `SelectionMode` interface

## [1.10.0](./#1.10.0) - 2025-04-15

### Added

- **Toggle Group**: Support `deselectable` prop to ensure one or more toggle is selected at any time.

- **Splitter**
  - Expose `api.resetSizes()` to reset the size to the initial specified size
  - Fix ArrowUp resizing in vertical orientation.

### Fixed

- **Select**: Clear `data-focus` from the trigger when interacting with another editable element.

- **Floating Panel**: Close an open panel when clicking its trigger

## [1.9.3](./#1.9.3) - 2025-04-10

### Fixed

- **Floating Panel**
  - Change default strategy from `absolute` to `fixed` to improve positioning consistency
  - Implement controlled open/close state
  - Constrain dragging to the boundary so content cannot move completely outside it

## [1.9.2](./#1.9.2) - 2025-04-10

### Fixed

- **Floating Panel**: Export `StageTriggerProps` and `AnchorPositionDetails`

## [1.9.1](./#1.9.1) - 2025-04-10

### Changed

- **Floating Panel**
  - Update props and APIs to be consistent with other components
  - Keep position and size in sync

## [1.9.0](./#1.9.0) - 2025-04-09

### Added

- **Toast**: Support queuing toasts that exceed the maximum limit. When the maximum number of toasts is reached:
  - New toasts are added to a queue instead of being dropped
  - Queued toasts are automatically displayed when space becomes available
  - Queue is cleared when all toasts are removed

- **Listbox**
  - Support clearing selection on Escape press
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
  - Respect `loopFocus` during keyboard navigation.
  - Fix `extended` selection mode.

- **DOM Query**: Fix macOS and iOS platform detection.

## [1.8.0](./#1.8.0) - 2025-04-04

### Added

- **Listbox**: Add the listbox component with single and multiple selection modes.

### Changed

- **ListCollection**: Fix staleness issues in mutation methods by returning a new `ListCollection` instead of mutating
  the internal `items`

### Fixed

- **Tabs**: Fix inconsistent indicator animations.

- **Date Picker**
  - Prevent errors when navigating month view.
  - Reset range selection when clicking the start date again.

- **Interact Outside**
  - Fix outside pointerdown detection on mobile devices.
  - Improve pointerdown outside click detection in shadow DOM environments.

## [1.7.0](./#1.7.0) - 2025-03-28

### Added

- **Slider**
  - Support `origin: end` to align the thumb to the end of the track.
  - Expose `thumbSize` as CSS variables in the root element. Can be useful for styling the slider.

- **Menu**: Fix `addItemListener` event handling.

### Fixed

- **Slider**: Apply the `thumbSize` CSS variable.

## [1.6.2](./#1.6.2) - 2025-03-27

### Fixed

- **Frameworks**: Start the machine before processing events.
- **Menu**: Add `addItemListener` function to allow listening for dispatched custom event on menu item.

## [1.6.1](./#1.6.1) - 2025-03-26

### Fixed

- **Hover Card, Color Picker**: Add missing `tabIndex` to improve usage within dialogs
- **Menu**
  - Assign unique IDs to menu items
  - Dispatch `menu:select` event on the menu item when it is selected

## [1.6.0](./#1.6.0) - 2025-03-24

### Added

- **Collapsible**: Add collapsible indicator part

### Fixed

- **Splitter**: Call `onResizeStart` and `onResizeEnd` during keyboard resizing

- **Combobox**: Prevent duplicate `onOpenChange` calls while editing the input.

### Changed

- **Color Utils**: Export `ColorStringFormat` type

## [1.5.0](./#1.5.0) - 2025-03-20

### Fixed

- **File Utils**: Respect `name` in `downloadFile`

### Changed

- **Number Input**: Set the default step to `0.01` when `formatOptions.style` is set to `percent`

- **Splitter (breaking)**: Redesign splitter machine to support more use cases and improve DX.

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

  Also add:
  - Support for collapsible panels
  - Support for collapse and expand events
  - Methods for resizing the panels programmatically

## [1.4.2](./#1.4.2) - 2025-03-18

### Fixed

- **Toast**: Allow `offsets: undefined` without throwing

- **Select**: Keep `valueAsString` reactive

## [1.4.1](./#1.4.1) - 2025-03-17

### Fixed

- **Slider**: Fix value normalization

## [1.4.0](./#1.4.0) - 2025-03-14

### Added

- **Splitter**
  - Add `api.setSizes` to set the size of multiple panels
  - Add `api.getSize` to get the size of a panel

### Fixed

- **Number Input**: Report the correct `valueAsNumber` in `onValueChange`

- **Slider**: Position thumbs correctly when `min` is nonzero

## [1.3.3](./#1.3.3) - 2025-03-10

### Fixed

- **Combobox**: Prevent unexpected cursor movement while editing

- **Tags Input**: Improve caret detection logic to prevent unwanted tag removal

- **Timer**
  - Keep timing consistent when switching tabs or windows
  - Change default `interval` value from `250` to `1000`

## [1.3.2](./#1.3.2) - 2025-03-08

### Fixed

- **Pin Input**: Fix OTP SMS autofill.

- **Date Picker**: Prevent Svelte's `state_unsafe_mutation` error in controlled range mode.

- **Rating Group**: Fix focus placement when clicking the label.

- **React**: Flush effects synchronously rather than within a microtask.

- **Checkbox**: Omit `data-invalid` when `invalid` is `false`.

## [1.3.1](./#1.3.1) - 2025-03-05

### Fixed

- **Radio Group, Switch**: Improve focus behavior in Safari browser.

- **Accordion**: Open content when clicking triggers in Safari.

- **Auto Resize**
  - Fix height calculations on high-DPI displays.
  - Account for `maxHeight`, `overflowY`, and `boxSizing` CSS properties.
  - Calculate height when its form owner resets.

## [1.3.0](./#1.3.0) - 2025-03-03

### Fixed

- **General**: Fix handling of complex objects in machine state.

### Added

- **Date Picker**
  - Support `api.getViewProps`.
  - Add `visibleRangeText` property to `api.offset()` return value.

- **Progress**: Format `api.percentAsString` with `locale` and `formatOptions`.

- **Framework Adapters (React, Svelte, Solid, Vue)**: Support `reenter:true` in machine transitions.

## [1.2.1](./#1.2.1) - 2025-02-27

### Fixed

- **Progress**: Allow for more precise (decimal) values.

- **Scroll Snap**: Prevent `getScrollPadding` from returning `NaN` in test environments.

- **Date Picker**: Call `onValueChange` when clearing the value.

- **Number Input**: Respect `allowOverflow`.

## [1.2.0](./#1.2.0) - 2025-02-26

### Fixed

- **Signature Pad**
  - Prevent React controlled-input warnings from the hidden input.
  - Return an empty string from `getDataUrl` in `onDrawEnd` after clearing the pad.

- **React**: Replay effects during Hot Module Replacement so changes apply without a page refresh.

- **Toggle Group**: Accept arrays in `api.setValue`.

- **Pin Input**: Fix `flushSync was called from inside a lifecycle method` warning.

- **Vue**: Prevent `choose is not a function` errors.

- **File Upload**: Handle unavailable `win.DataTransfer` in test environments.

- **Time Picker**: Fix `[@zag-js/dismissable] node is null or undefined` warning when lazy mounting the content.

### Added

- **Pin Input**: Support `count` prop to improve SSR `aria-label` attribute.

## [1.1.0](./#1.1.0) - 2025-02-26

### Fixed

- **Pin Input**: Fix editing existing values.

- **Number Input**: Respect the controlled `value` prop.

- **Carousel**: Respect the controlled `page` prop.

- **Textarea**: Prevent `ResizeObserver` loop warnings about undelivered notifications.

### Added

- **Toggle**: Bring back toggle machine.

- **Hover Card**: Expose interaction outside handlers to hover card.

## [1.0.2](./#1.0.2) - 2025-02-24

### Fixed

- **Collection**: Widen `items` type to allow `Iterable` instead of just `Array` since we internally convert iterables
  to an array.

- **Carousel**: Enforce required `slideCount` to ensure machine works as expected.

- **Framework Bindings**: Filter `undefined` values before resolving props.

- **React**: Avoid `flushSync` warnings during unmount.

## [1.0.1](./#1.0.1) - 2025-02-23

### Fixed

- **Select**: Fix regression where `multiple: true` doesn't work.

- **Timer**: Restart when `startMs` changes.

- **Toggle Group**: Remove `data-focus` on blur.

- **Toast**: Include toast close buttons in keyboard navigation before leaving the toast group.

### Added

- Add `<component>.Machine` type to help when typecasting generic components like combobox and select.

## [1.0.0](./#1.0.0) - 2025-02-22

### Changed

- **Core**: Rewrite machines for increased performance and initial mount time. The results show roughly 1.5x - 4x
  performance improvements across components.

- **Toast (breaking)**
  - Require the creation of a toast store using `createStore`
  - **Solid.js**: Require the usage of `<Key>` component to render toasts

### Fixed

- **Menu**: Reposition context menus on subsequent right-clicks.

- **Avatar**: Fix `api.setSrc` updates.

- **File Upload**: Support drag-and-drop when `directory: true`.

- **Carousel**
  - Respect the initial page.
  - Keep pagination in sync after using dot indicators.

- **Timer**: Keep the timer running when switching tabs.
