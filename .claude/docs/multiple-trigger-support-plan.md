# Multiple Trigger Support Implementation Plan

Add support for multiple triggers with value tracking across Zag components, based on base-ui's Popover pattern.

## Status

**Phase 1 (Dialog): ✅ COMPLETED**
- Core implementation complete with smart trigger switching
- Focus restoration to active trigger
- Both controlled and uncontrolled modes working
- Comprehensive examples with table UI and payload management
- Changeset created
- Ready for testing and PR

**Phase 2 (Tooltip): ✅ COMPLETED**
- Multiple trigger support implemented
- Positioning anchors to active trigger
- Focus management working
- Smart switching implemented
- All triggers excluded from outside click

**Phase 2 (Menu): ✅ COMPLETED**
- Multiple trigger support implemented (both button and context triggers)
- Positioning anchors to active trigger
- Focus management with Tab navigation fix
- Smart switching implemented
- All triggers excluded from outside click
- Context menu support (getContextTriggerProps)
- Example created: menu-multiple-trigger.tsx
- Documentation updated in multiple-trigger-research.md

**Next Steps:**
- Add unit tests for Dialog, Tooltip, and Menu
- Apply pattern to remaining components (Popover, Hover Card, Bottom Sheet)

## Overview

This feature allows components like Dialog, Popover, Menu, etc. to have multiple triggers, where each trigger can be identified by a unique value. The machine tracks which trigger activated it, enabling context-aware UIs.

### Key Features Implemented

1. **Smart Trigger Switching** - Clicking a different trigger while dialog is open switches content without closing
2. **Focus Restoration** - Automatically returns focus to the active trigger on close
3. **Data Attributes** - `data-value` and `data-current` for styling and identification
4. **Programmatic Control** - `setActiveTriggerValue()` API method
5. **Controlled & Uncontrolled Modes** - Full support for both patterns
6. **100% Backward Compatible** - Existing code works without changes

## Design Decisions

### What We're Tracking

- ✅ **Track value only** - Simple string identifier for each trigger
- ❌ **No payload support** - Users manage complex data in userland (keeps types simple, no generics needed)
- ✅ **No new packages** - Simple context properties in each machine
- ✅ **Both modes** - Controlled and uncontrolled support (like `open`/`defaultOpen`)
- ✅ **Backward compatible** - `getTriggerProps()` without args works as before
- ✅ **Positioning support** - Use `data-ownedby` to link triggers and enable dynamic anchoring

### Naming Convention

```typescript
activeTriggerValue         // Current trigger value
defaultActiveTriggerValue  // Initial trigger value (uncontrolled)
onActiveTriggerChange      // Callback when trigger changes
```

### Data Attributes

```typescript
"data-ownedby": uid       // Links trigger to component instance (always present)
"data-value": value       // Identifies specific trigger (only when value provided)
"data-current": ""        // Present on the currently active trigger (when dialog is open)
```

### Custom IDs Support

The `ids.trigger` prop now supports both string and function forms:

```typescript
// String form (backward compatible, single trigger)
ids: {
  trigger: "my-custom-trigger"
}

// Function form (supports multiple triggers)
ids: {
  trigger: (value) => value ? `custom-${value}` : 'custom-trigger'
}
```

**Type signature:**
```typescript
type ElementIds = Partial<{
  trigger: string | ((value?: string) => string)
  // ... other elements
}>
```

## Smart Trigger Switching

When the dialog is already open and a different trigger is clicked, the implementation uses smart switching logic:

```typescript
// Clicking a different trigger while open switches content without closing
// This is handled by the ACTIVE_TRIGGER.SET event

if (open && value && activeTriggerValue !== value) {
  send({ type: "ACTIVE_TRIGGER.SET", value })  // Switch trigger
} else {
  send({ type: "TOGGLE", value })  // Normal toggle
}
```

**Behavior Matrix:**

| Dialog State | Trigger Clicked | Event | Result |
|--------------|-----------------|-------|--------|
| Closed | Any trigger | TOGGLE | Opens with that value |
| Open | Same trigger | TOGGLE | Closes |
| Open | Different trigger | ACTIVE_TRIGGER.SET | Stays open, updates value |
| Open | No-value trigger | TOGGLE | Closes |

## Focus Restoration

The dialog automatically restores focus to the active trigger when closing:

```typescript
// Priority order:
// 1. finalFocusEl (if provided)
// 2. Active trigger element (if activeTriggerValue is set)
// 3. Default behavior (element that had focus before dialog opened)
```

## Backward Compatibility

**100% backward compatible** - existing code continues to work without changes:

```typescript
// Old code (still works)
<button {...api.getTriggerProps()}>Open</button>

// What it renders:
<button
  data-scope="dialog"
  data-part="trigger"
  data-ownedby="dialog-1"        // NEW: but doesn't break anything
  id="dialog-1-trigger"
  // NO data-trigger-value (not provided)
>
```

**Behavior when no value provided:**
- ✅ Dialog/popover opens and closes normally
- ✅ Outside click works (trigger excluded via `data-ownedby`)
- ✅ `activeTriggerValue` is `null` (safe to check)
- ✅ Positioning uses first trigger found (for positioned components)
- ✅ All existing tests pass

## API Design

### Machine Props

```typescript
interface DialogProps {
  /**
   * The ids of the elements in the dialog. Useful for composition.
   * Note: `trigger` is now a function to support multiple triggers
   */
  ids?: ElementIds | undefined

  /**
   * The controlled active trigger value
   */
  activeTriggerValue?: string | null | undefined

  /**
   * The default active trigger value (uncontrolled mode)
   */
  defaultActiveTriggerValue?: string | null | undefined

  /**
   * Callback when the active trigger changes
   */
  onActiveTriggerChange?: ((details: TriggerChangeDetails) => void) | undefined
}

type ElementIds = Partial<{
  trigger: string | ((value?: string) => string)  // NEW: Function form for multiple triggers
  contextTrigger: string | ((value?: string) => string)  // NEW: For menu context triggers
  positioner: string
  backdrop: string
  content: string
  closeTrigger: string
  title: string
  description: string
}>

interface TriggerChangeDetails {
  /**
   * The value of the trigger that activated the component
   */
  value: string | null
}
```

### Component API

```typescript
interface DialogApi {
  /**
   * The current active trigger value
   */
  activeTriggerValue: string | null

  /**
   * Set the active trigger value programmatically
   */
  setActiveTriggerValue(value: string | null): void

  /**
   * Get trigger props with optional value identifier
   */
  getTriggerProps(options?: { value: string }): ButtonProps
}
```

### Usage Example

```typescript
// Setup dialog machine
const [state, send] = useMachine(dialog.machine({ id: "dialog" }))
const api = dialog.connect(state, send, normalizeProps)

// Multiple triggers with values
<button {...api.getTriggerProps({ value: 'edit-user' })}>
  Edit User
</button>

<button {...api.getTriggerProps({ value: 'create-user' })}>
  Create User
</button>

<button {...api.getTriggerProps({ value: 'delete-user' })}>
  Delete User
</button>

// Access active trigger in dialog content
<div {...api.getContentProps()}>
  {api.activeTriggerValue === 'edit-user' && <EditUserForm />}
  {api.activeTriggerValue === 'create-user' && <CreateUserForm />}
  {api.activeTriggerValue === 'delete-user' && <DeleteConfirmation />}
</div>

// Or use for styling
<div data-active-trigger={api.activeTriggerValue}>
  {/* Dialog content */}
</div>

// BACKWARD COMPATIBLE: Works without value
<button {...api.getTriggerProps()}>
  Open Dialog
</button>
// activeTriggerValue will be null, but dialog opens/closes normally

// Custom IDs for triggers
const [state, send] = useMachine(
  dialog.machine({
    id: "dialog",
    ids: {
      trigger: (value) => value ? `custom-${value}-btn` : 'custom-trigger',
      content: 'custom-content'
    }
  })
)

// Renders with custom IDs
<button {...api.getTriggerProps({ value: 'edit' })} />
// id="custom-edit-btn"

<button {...api.getTriggerProps({ value: 'create' })} />
// id="custom-create-btn"

<button {...api.getTriggerProps()} />
// id="custom-trigger" (no value)
```

### Controlled Mode Example

```typescript
const [activeTrigger, setActiveTrigger] = useState<string | null>(null)

const [state, send] = useMachine(
  dialog.machine({
    id: "dialog",
    activeTriggerValue: activeTrigger,
    onActiveTriggerChange: (details) => {
      console.log('Trigger changed to:', details.value)
      setActiveTrigger(details.value)
    }
  })
)
```

### Userland Payload Management

Since we're not supporting payloads in the machine, users manage complex data themselves:

```typescript
// User manages payload state
const [dialogData, setDialogData] = useState<{ userId?: number } | null>(null)

// Custom handlers with payload
<button
  onClick={() => {
    setDialogData({ userId: 123 })
    api.setOpen(true)
  }}
>
  Edit User 123
</button>

// Fully typed access in dialog
{dialogData?.userId && <EditForm userId={dialogData.userId} />}
```

## Menu Component: Multiple Context Triggers

Menu has a unique requirement: it supports **both button triggers AND context triggers** (right-click areas).

### Usage Example

```typescript
const api = menu.connect(state, send, normalizeProps)

// Multiple button triggers
<button {...api.getTriggerProps({ value: 'file-menu' })}>File</button>
<button {...api.getTriggerProps({ value: 'edit-menu' })}>Edit</button>
<button {...api.getTriggerProps({ value: 'view-menu' })}>View</button>

// Multiple context menu triggers (right-click areas)
<div {...api.getContextTriggerProps({ value: 'canvas-area' })}>
  Canvas (right-click me)
</div>

<div {...api.getContextTriggerProps({ value: 'sidebar-area' })}>
  Sidebar (right-click me)
</div>

// In menu content, check which trigger was used
<div {...api.getContentProps()}>
  {api.activeTriggerValue === 'file-menu' && <FileMenuItems />}
  {api.activeTriggerValue === 'canvas-area' && <CanvasContextMenu />}
  {api.activeTriggerValue === 'sidebar-area' && <SidebarContextMenu />}
</div>
```

### Custom IDs for Both Trigger Types

```typescript
const [state, send] = useMachine(
  menu.machine({
    id: "menu",
    ids: {
      trigger: (value) => value ? `menu-btn-${value}` : 'menu-trigger',
      contextTrigger: (value) => value ? `ctx-${value}` : 'context-trigger'
    }
  })
)
```

### Positioning & Exclusion

All triggers (button + context) are:
- ✅ Excluded from outside click via `data-ownedby`
- ✅ Queried together using `getAllTriggerEls(scope, uid)`
- ✅ Active trigger used for positioning via `getActiveTriggerEl(scope, uid, value)`

## Positioning Components Requirements

For components with positioning (Popover, Tooltip, Hover Card), we need to handle:

### 1. Anchor to Active Trigger

The positioned element should anchor to whichever trigger activated it.

```typescript
// Trigger 1 at top of page
<button {...api.getTriggerProps({ value: 'trigger-1' })}>Top</button>

// Trigger 2 at bottom of page
<button {...api.getTriggerProps({ value: 'trigger-2' })}>Bottom</button>

// Popover should position relative to the active trigger
<div {...api.getContentProps()}>
  {/* Positions near trigger-1 or trigger-2 based on which was clicked */}
</div>
```

### 2. Exclude All Triggers from Outside Click

The dismiss behavior should exclude ALL triggers, not just one.

```typescript
// All three triggers should be excluded from outside click detection
<button {...api.getTriggerProps({ value: 'edit' })}>Edit</button>
<button {...api.getTriggerProps({ value: 'create' })}>Create</button>
<button {...api.getTriggerProps({ value: 'delete' })}>Delete</button>
```

### Implementation: `data-ownedby` Attribute

Use `data-ownedby` to link all triggers to their popover instance:

```typescript
// Each trigger element gets these attributes:
{
  "data-scope": "popover",           // existing - identifies element type
  "data-part": "trigger",            // existing - identifies the part
  "data-ownedby": uid,               // NEW - links trigger to this instance
  "data-trigger-value": "edit",      // NEW - identifies this specific trigger (only if value provided)
  "id": `${scope}-trigger-edit`,     // unique ID
}

// Selector to find all triggers for this instance:
`[data-scope="popover"][data-part="trigger"][data-ownedby="${uid}"]`

// Selector to find the active trigger:
`[data-scope="popover"][data-part="trigger"][data-ownedby="${uid}"][data-trigger-value="${value}"]`
```

### DOM Helper Functions

```typescript
// In popover.dom.ts

/**
 * Get trigger ID (respects custom ids.trigger)
 */
export const getTriggerId = (scope: string, value?: string) => {
  const customId = dom.resolveId(scope, "trigger")

  // If ids.trigger is a function, call it with the value
  if (typeof customId === "function") {
    return customId(value)
  }

  // If ids.trigger is a string, return it (backward compatible)
  if (customId) {
    return customId
  }

  // Default: generate ID with value suffix
  return value ? `${scope}-trigger-${value}` : `${scope}-trigger`
}

/**
 * Get all trigger elements for this popover instance
 * Used for: outside click exclusion
 *
 * Note: For Menu, this should query BOTH:
 * - [data-part="trigger"] (button triggers)
 * - [data-part="context-trigger"] (right-click areas)
 */
export const getAllTriggerEls = (scope: string, uid: string) => {
  const doc = dom.getDoc(scope)
  return Array.from(
    doc.querySelectorAll(
      `[data-scope="${scope}"][data-part="trigger"][data-ownedby="${uid}"]`
    )
  )

  // For Menu specifically:
  // const triggers = doc.querySelectorAll(
  //   `[data-scope="${scope}"][data-part="trigger"][data-ownedby="${uid}"],
  //    [data-scope="${scope}"][data-part="context-trigger"][data-ownedby="${uid}"]`
  // )
}

/**
 * Get the active trigger element
 * Used for: positioning anchor
 */
export const getActiveTriggerEl = (scope: string, uid: string, value: string | null) => {
  if (!value) {
    // Backward compatible: return first trigger if no value specified
    const triggers = getAllTriggerEls(scope, uid)
    return triggers[0] || null
  }

  const doc = dom.getDoc(scope)
  return doc.querySelector(
    `[data-scope="${scope}"][data-part="trigger"][data-ownedby="${uid}"][data-trigger-value="${value}"]`
  )
}
```

### Machine Changes

```typescript
// Add uid to context
context: {
  uid: scope,  // Use scope as uid (already unique)
  activeTriggerValue: string | null,
}

// Watch for active trigger changes and reposition
watch({ track, action }) {
  track([() => context.get("activeTriggerValue")], () => {
    action(["reposition"])
  })
}

// Update positioning effect to use active trigger
effect: {
  setupPositioning({ context, scope }) {
    const anchorEl = () => dom.getActiveTriggerEl(
      scope,
      context.uid,
      context.activeTriggerValue
    )
    // Use anchorEl for positioning...
  }
}

// Update dismissable effect to exclude all triggers
effect: {
  trackDismissableElement({ context, scope }) {
    return trackDismissableElement(getContentEl, {
      exclude: dom.getAllTriggerEls(scope, context.uid),  // All triggers excluded
      // ...
    })
  }
}
```

### Connect Changes

```typescript
getTriggerProps({ value } = {}) {
  return normalize.button({
    ...parts.trigger.attrs,
    id: dom.getTriggerId(scope, value),                 // Respects custom ids.trigger
    "data-ownedby": context.uid,                        // Always present
    "data-trigger-value": value || undefined,           // Only if value provided (backward compatible)
    "aria-haspopup": "dialog",
    onClick() {
      send({ type: "TOGGLE", value })
    }
  })
}
```

### Backward Compatibility

When no value is provided:

```typescript
// Without value (backward compatible)
<button {...api.getTriggerProps()}>Open</button>

// Renders as:
<button
  data-scope="popover"
  data-part="trigger"
  data-ownedby="popover-1"
  id="popover-1-trigger"
  // NO data-trigger-value attribute
>
  Open
</button>

// Behavior:
// - activeTriggerValue remains null
// - Positioning anchors to first trigger found
// - Outside click still excludes trigger (via data-ownedby)
// - Everything works as before
```

## Implementation Checklist

### Phase 1: Dialog (Prototype) ✅ COMPLETED

- [x] Update `packages/machines/dialog/src/dialog.types.ts`
  - [x] Update `ElementIds['trigger']` type to `string | ((value?: string) => string)`
  - [x] Add `activeTriggerValue` prop (controlled)
  - [x] Add `defaultActiveTriggerValue` prop (uncontrolled)
  - [x] Add `onActiveTriggerChange` callback prop
  - [x] Add `TriggerChangeDetails` interface
  - [x] Add `TriggerProps` interface (exported)
  - [x] Add `activeTriggerValue` to DialogSchema context
  - [x] Add `setActiveTriggerValue` to DialogApi
  - [x] Add JSDoc comments explaining the function form of `ids.trigger`
  - [x] Add `ACTIVE_TRIGGER.SET` event type
  - [x] Add `setActiveTrigger` action

- [x] Update `packages/machines/dialog/src/dialog.machine.ts`
  - [x] Add `activeTriggerValue` to context (bindable, defaults from `defaultActiveTriggerValue`)
  - [x] Update TOGGLE/OPEN event type to accept optional `value` property
  - [x] Add `ACTIVE_TRIGGER.SET` event handler in open state
  - [x] Add `setActiveTrigger` action to update `activeTriggerValue`
  - [x] Add `setActiveTrigger` to OPEN/TOGGLE actions in closed state
  - [x] Handle controlled mode (bindable context with onChange callback)
  - [x] Update `trackDismissableElement` effect to use `getTriggerEls()` for exclusion
  - [x] Add focus restoration logic (prioritizes active trigger)
  - [x] Value persists until explicitly changed (design decision: keep last value)

- [x] Update `packages/machines/dialog/src/dialog.dom.ts`
  - [x] Update `getTriggerId(scope, value?)` to handle:
    - [x] Function form of `ids.trigger` (call with value)
    - [x] String form of `ids.trigger` (return as-is, backward compatible)
    - [x] Default form (generate `dialog:${id}:trigger:${value}` or `dialog:${id}:trigger`)
  - [x] Add `getTriggerEls(scope)` helper function (queries by data-ownedby)
  - [x] Add `getActiveTriggerEl(scope, value)` helper function
  - [x] Updated to use `queryAll` and return HTMLElement[]

- [x] Update `packages/machines/dialog/src/dialog.connect.ts`
  - [x] Modify `getTriggerProps()` signature to accept optional `TriggerProps` with `value`
  - [x] Pass trigger value in TOGGLE event with smart switching logic
  - [x] Add ACTIVE_TRIGGER.SET event for switching triggers while open
  - [x] Add `activeTriggerValue` to returned API
  - [x] Add `setActiveTriggerValue` method to API
  - [x] Add `data-ownedby` attribute to trigger props (always present)
  - [x] Add `data-value` attribute to trigger props (only if value provided)
  - [x] Add `data-current` attribute to mark active trigger
  - [x] Use `dom.getTriggerId(scope, value)` for trigger ID (respects custom ids)
  - [x] Ensure backward compatibility (no value = works as before)

- [x] Update `packages/machines/dialog/src/dialog.props.ts`
  - [x] Add `activeTriggerValue` to props array
  - [x] Add `defaultActiveTriggerValue` to props array
  - [x] Add `onActiveTriggerChange` to props array

- [ ] Add tests in `packages/machines/dialog/tests/`
  - [ ] Test multiple triggers can open the same dialog
  - [ ] Test `activeTriggerValue` is set correctly for each trigger
  - [ ] Test controlled mode with `activeTriggerValue` prop
  - [ ] Test uncontrolled mode with `defaultActiveTriggerValue`
  - [ ] Test `onActiveTriggerChange` callback is invoked with correct value
  - [ ] Test backward compatibility (getTriggerProps without value)
  - [ ] Test `data-ownedby` attribute is present on all triggers
  - [ ] Test `data-trigger-value` attribute is present when value provided
  - [ ] Test `data-trigger-value` is NOT present when no value provided
  - [ ] Test `getAllTriggerEls` returns all triggers
  - [ ] Test outside click excludes all triggers (not just one)
  - [ ] Test custom IDs with function form: `ids.trigger = (value) => ...`
  - [ ] Test custom IDs with string form: `ids.trigger = "custom"` (backward compatible)
  - [ ] Test default ID generation with value: `${scope}-trigger-${value}`
  - [ ] Test default ID generation without value: `${scope}-trigger`
  - [ ] Test behavior when dialog closes (value cleared or persisted?)

- [ ] Add Playwright E2E test
  - [ ] Test multi-trigger scenario in React example app

### Phase 2: Apply to Other Components

- [ ] **Popover** (`packages/machines/popover/`) - **Includes positioning logic**
  - [ ] Update types (same as dialog)
  - [ ] Update machine:
    - [ ] Add `uid` and `activeTriggerValue` to context
    - [ ] Update events to accept `value` property
    - [ ] Add watch to reposition when `activeTriggerValue` changes
    - [ ] Update positioning effect to anchor to active trigger using `getActiveTriggerEl()`
    - [ ] Update dismissable effect to exclude all triggers using `getAllTriggerEls()`
  - [ ] Update dom.ts:
    - [ ] Add `getAllTriggerEls(scope, uid)`
    - [ ] Add `getActiveTriggerEl(scope, uid, value)` with fallback to first trigger
  - [ ] Update connect:
    - [ ] Add `data-ownedby` and `data-trigger-value` to trigger props
    - [ ] Update trigger ID generation
  - [ ] Add tests:
    - [ ] Test positioning anchors to correct trigger
    - [ ] Test repositioning when different trigger is activated
    - [ ] Test all triggers excluded from outside click

- [x] **Menu** (`packages/machines/menu/`) - **Includes positioning + context triggers** ✅ COMPLETED
  - [x] Update types:
    - [x] Update `ElementIds['trigger']` to `string | ((value?: string) => string)`
    - [x] Update `ElementIds['contextTrigger']` to `string | ((value?: string) => string)`
    - [x] Add `activeTriggerValue`, `defaultActiveTriggerValue`, `onActiveTriggerChange`
    - [x] Add `ActiveTriggerChangeDetails` and `TriggerProps` interfaces
  - [x] Update machine:
    - [x] Add `activeTriggerValue` to context (bindable)
    - [x] Update events to accept `value` property
    - [x] Add `ACTIVE_TRIGGER.SET` event handler
    - [x] Add `setActiveTrigger` action
    - [x] Update positioning effect to anchor to active trigger
    - [x] Update `reposition` action to use active trigger
    - [x] Update dismissable effect to exclude all triggers
    - [x] Fix focus management (moved `focusTrigger` from entry to transitions)
  - [x] Update dom.ts:
    - [x] Add `getTriggerEls(scope)` - queries all button triggers
    - [x] Add `getContextTriggerEls(scope)` - queries all context triggers
    - [x] Add `getActiveTriggerEl(scope, value)` with fallback
    - [x] Add `getActiveContextTriggerEl(scope, value)` with fallback
    - [x] Update `getTriggerId` to accept optional value parameter (function/string/default)
    - [x] Update `getContextTriggerId` to accept optional value parameter
  - [x] Update connect:
    - [x] Modify `getTriggerProps({ value })` - button triggers
    - [x] Modify `getContextTriggerProps({ value })` - context menu triggers
    - [x] Add smart switching logic (ACTIVE_TRIGGER.SET vs TRIGGER_CLICK)
    - [x] Add `data-ownedby`, `data-value`, `data-current` to both trigger types
    - [x] Update trigger ID generation for both types
    - [x] Add `activeTriggerValue` to API
    - [x] Add `setActiveTriggerValue` method to API
    - [x] Update `aria-labelledby` to use active trigger ID
  - [x] Update props.ts:
    - [x] Add `activeTriggerValue`, `defaultActiveTriggerValue`, `onActiveTriggerChange`
  - [x] Update index.ts:
    - [x] Export `ActiveTriggerChangeDetails` and `TriggerProps` types
  - [x] Create example:
    - [x] Created `menu-multiple-trigger.tsx` with document manager pattern
  - [ ] Add tests:
    - [ ] Test multiple button triggers
    - [ ] Test multiple context triggers (right-click areas)
    - [ ] Test mix of button + context triggers
    - [ ] Test positioning anchors to correct trigger (button or context area)
    - [ ] Test all triggers (both types) excluded from outside click
    - [ ] Test Tab navigation between triggers
    - [ ] Test focus restoration to active trigger on close
    - [ ] Test smart switching (clicking different trigger while open)

- [x] **Tooltip** (`packages/machines/tooltip/`) - **Includes positioning logic** ✅ COMPLETED
  - [x] Update types (same as dialog)
  - [x] Update machine (positioning and focus management)
  - [x] Update dom.ts (`getTriggerEls` and `getActiveTriggerEl`)
  - [x] Update connect (add data attributes and smart switching)
  - [ ] Add tests (including positioning tests)

- [ ] **Hover Card** (`packages/machines/hover-card/`) - **Includes positioning logic**
  - [ ] Update types (same as dialog)
  - [ ] Update machine (similar to popover with positioning)
  - [ ] Update dom.ts (`getAllTriggerEls` and `getActiveTriggerEl`)
  - [ ] Update connect (add data attributes)
  - [ ] Add tests (including positioning tests)

- [ ] **Bottom Sheet** (`packages/machines/bottom-sheet/`)
  - [ ] Update types
  - [ ] Update machine
  - [ ] Update connect
  - [ ] Add tests

### Phase 3: Documentation & Examples

- [ ] **Documentation**
  - [ ] Create multi-trigger guide in `.claude/docs/`
  - [ ] Update Dialog component documentation
  - [ ] Update Popover component documentation
  - [ ] Update Menu component documentation
  - [ ] Add migration guide for existing users
  - [ ] Document the "no payload" decision and userland approach

- [x] **Examples** (in `/Users/segunadebayo/Documents/code/zag/examples/next-ts`)
  - [x] Create `pages/dialog-multiple-trigger.tsx`
    - [x] User management table with edit actions
    - [x] Trigger values using user IDs
    - [x] Context-aware content based on `activeTriggerValue`
    - [x] Uncontrolled mode with payload management
    - [x] Uses mergeProps pattern with getTriggerProps
    - [x] Demonstrates Presence component integration
  - [x] Create `pages/dialog-multiple-trigger-controlled.tsx`
    - [x] User management table (same pattern)
    - [x] Fully controlled mode (both open and activeTriggerValue)
    - [x] Shows state sync between local and API state
    - [x] Demonstrates controlled payload management
  - [ ] Create `pages/composition/popover-multiple-trigger.tsx`
    - [ ] Multiple triggers at different positions
    - [ ] Demonstrate repositioning to active trigger
    - [ ] Show outside click excluding all triggers
  - [x] Create `pages/composition/menu-multiple-trigger.tsx` ✅ COMPLETED
    - [x] Document manager with multiple menu triggers per row
    - [x] Shows active trigger value tracking
    - [x] Demonstrates mergeProps pattern for payload management
    - [x] Menu items: Rename, Delete
    - [x] Shows positioning to active trigger
  - [ ] Create `pages/composition/tooltip-multiple-trigger.tsx`
    - [ ] Multiple hover triggers
    - [ ] Positioning to active trigger
  - [ ] Create `pages/composition/hover-card-multiple-trigger.tsx`
    - [ ] Multiple hover triggers
    - [ ] Show user cards based on trigger

- [ ] **TypeScript**
  - [ ] Ensure all types are properly exported
  - [ ] Update type documentation/JSDoc comments

### Phase 4: Testing & Quality

- [ ] **Cross-framework testing**
  - [ ] Test in React adapter
  - [ ] Test in Vue adapter
  - [ ] Test in Solid adapter
  - [ ] Test in Svelte adapter

- [ ] **Integration testing**
  - [ ] Test with existing Zag patterns (composition, etc.)
  - [ ] Test accessibility (no regressions)
  - [ ] Test keyboard navigation
  - [ ] Test focus management

- [ ] **Performance**
  - [ ] Ensure no performance regressions
  - [ ] Benchmark with multiple triggers

## Design Decisions Made

1. **Value persistence on close** ✅
   - **Decision:** Keep last trigger value until explicitly changed
   - Allows checking which trigger was last used even after close
   - More predictable state management

2. **Auto-generated values** ✅
   - **Decision:** Do NOT auto-generate values
   - Keep explicit - value is optional
   - Backward compatible with existing single-trigger code

3. **Data attribute naming** ✅
   - **Decision:** Use `data-value` instead of `data-trigger-value`
   - Shorter, cleaner, context already clear from `data-part="trigger"`
   - Added `data-current` to mark active trigger

4. **Smart switching** ✅
   - **Decision:** Clicking different trigger while open switches content
   - Uses `ACTIVE_TRIGGER.SET` event (separate from TOGGLE)
   - Clicking same trigger still toggles (closes)

5. **API method naming** ✅
   - **Decision:** `setActiveTriggerValue` (not `setActiveTrigger`)
   - Consistent with property name `activeTriggerValue`
   - Matches `setOpen` pattern

## Benefits

1. **Context-aware UIs** - Show different content based on which trigger activated
2. **Better styling** - CSS targeting via `[data-trigger-value="edit"]`
3. **Analytics** - Track which triggers are used most
4. **Testing** - Easy to assert which trigger opened dialog
5. **Accessibility** - Could enhance announcements based on trigger context
6. **Simple types** - No generics needed, clean API
7. **Flexible IDs** - Function form allows custom ID patterns for any number of triggers
8. **Positioning** - Automatic anchoring to the active trigger for positioned components

## Migration Impact

- **Breaking Changes:** None (fully backward compatible)
- **New Features:**
  - Multiple trigger support with value tracking
  - `activeTriggerValue` / `defaultActiveTriggerValue` / `onActiveTriggerChange` props
  - `getTriggerProps({ value })` API
  - `setActiveTriggerValue(value)` API method for programmatic control
  - `data-ownedby`, `data-value`, and `data-current` data attributes
  - Function form for `ids.trigger` to customize trigger IDs: `(value?: string) => string`
  - Smart trigger switching (ACTIVE_TRIGGER.SET event)
  - Automatic focus restoration to active trigger
  - All triggers excluded from outside click automatically
  - Dynamic positioning for multiple triggers (future: Popover, Tooltip, Hover Card)
- **Type Changes (Non-breaking):**
  - `ElementIds['trigger']` now accepts `string | ((value?: string) => string)`
  - `getTriggerProps` signature: `(props?: TriggerProps) => ButtonProps`
  - `TriggerProps` interface exported: `{ value?: string }`
  - `DialogApi` includes `setActiveTriggerValue` method
  - New events: `ACTIVE_TRIGGER.SET`
  - New action: `setActiveTrigger`
- **Deprecations:** None
- **Changeset Type:** Minor (new features, no breaking changes)
- **Changeset Created:** `.changeset/dialog-multiple-triggers.md`

## References

- Base UI Popover implementation: `/Users/segunadebayo/Documents/code/base-ui/packages/react/src/popover/`
- Base UI tests: `/Users/segunadebayo/Documents/code/base-ui/packages/react/src/popover/root/PopoverRoot.test.tsx` (lines 1124-1469)
