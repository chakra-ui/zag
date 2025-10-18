# Multiple Triggers Research: UI Component Libraries

Comprehensive research on how popular UI libraries handle multiple triggers for Dialog, Popover, Menu, and Tooltip components.

**Date:** 2025-10-17
**Libraries Analyzed:** Base UI, Radix UI, React Aria, Mantine, Ariakit, Headless UI, Bootstrap

---

## Executive Summary

| Library | Native Support | Approach | Key Pattern |
|---------|---------------|----------|-------------|
| **Base UI** | ✅ Yes (Popover) | Trigger ID + Map registry | Function prop for trigger IDs |
| **Radix UI** | ❌ No | Single trigger ref | Focus management issues |
| **React Aria** | ⚠️ Partial | Dynamic triggerRef | Reference-based, WeakMap |
| **Mantine** | ❌ No | Event configuration | Trigger types, manual wiring |
| **Ariakit** | ✅ Yes (hover/focus) | Multiple disclosure elements | State updates on interaction |
| **Headless UI** | ❌ No | Single trigger | Composition approach |
| **Bootstrap** | ⚠️ Mixed | Space-separated triggers | Multiple event types only |

---

## 1. Base UI (MUI) - ✅ Full Support

**Status:** Most comprehensive multiple trigger implementation

### Implementation

```typescript
// Store state
type State = {
  activeTriggerId: string | null
  triggers: Map<string, { element: HTMLElement; getPayload?: () => Payload }>
  payload: unknown | undefined
}

// API
<Popover.Root triggerId={activeTrigger} onOpenChange={...}>
  <Popover.Trigger id="trigger-1" payload={data1}>Button 1</Popover.Trigger>
  <Popover.Trigger id="trigger-2" payload={data2}>Button 2</Popover.Trigger>

  <Popover.Popup>
    {({ payload }) => <Content data={payload} />}
  </Popover.Popup>
</Popover.Root>
```

### Key Features
- ✅ Explicit trigger IDs required
- ✅ Trigger registry Map
- ✅ Payload support per trigger
- ✅ Controlled and uncontrolled modes
- ✅ Automatic single-trigger resolution
- ✅ Render function with payload access

### Design Decisions
- React-specific (uses refs and DOM tracking)
- Tracks actual HTMLElement references in registry
- Manages registration/unregistration lifecycle
- Auto-selects when only one trigger exists

**Files:** `/Users/segunadebayo/Documents/code/base-ui/packages/react/src/popover/`

---

## 2. Radix UI - ❌ No Native Support

**Status:** Single trigger only, community workarounds exist

### Current Architecture

```typescript
// Context stores single trigger ref
type DialogContextValue = {
  triggerRef: React.RefObject<HTMLButtonElement | null>  // SINGLE
  contentId: string
  open: boolean
  onOpenChange(open: boolean): void
}

// Focus restoration (line 281)
context.triggerRef.current?.focus()  // Always same trigger
```

### GitHub Issues

**Issue #2469 - Dialog: Add Support multiple Triggers**
- Focus returns to last trigger, not the one that opened dialog
- Current workaround: Create separate Dialog instances per trigger

**Discussion #1532 - Dialog with multiple Triggers**
- Official response: "Multiple triggers don't make conceptual sense"
- For Popover: "No way to know where to attach content with 2 triggers"
- Recommendation: Reuse components instead of single instance

**Issue #2270 - Return focus to correct trigger**
- Problem confirmed but no official solution

### Limitations
- ❌ Cannot track which trigger opened dialog
- ❌ Focus always returns to first/last trigger
- ❌ No trigger identification system
- ❌ Architecture assumes 1:1 relationship

### Workarounds
```typescript
// Community workaround: Separate instances
function MultiTriggerDialog() {
  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger>Edit</Dialog.Trigger>
        <Dialog.Portal><EditContent /></Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root>
        <Dialog.Trigger>Delete</Dialog.Trigger>
        <Dialog.Portal><DeleteContent /></Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
```

**Files:** `/Users/segunadebayo/Documents/code/radix-ui/packages/react/{dialog,popover}/`

---

## 3. React Aria (Adobe Spectrum) - ⚠️ Partial Support

**Status:** Single state with dynamic trigger refs

### Architecture

```typescript
// Dynamic trigger reference
export interface AriaPopoverProps {
  triggerRef: RefObject<Element | null>  // Pass different refs for different triggers
  popoverRef: RefObject<Element | null>
  placement?: Placement
}

// WeakMap registry for cleanup
const onCloseMap: WeakMap<Element, () => void> = new WeakMap()

// Positioning updates automatically
useLayoutEffect(updatePosition, [targetRef.current, ...])
```

### API Pattern

```typescript
function MultiTriggerPopover() {
  const [activeTrigger, setActiveTrigger] = useState<'btn1' | 'btn2' | null>(null)
  const trigger1Ref = useRef(null)
  const trigger2Ref = useRef(null)
  const state = useOverlayTriggerState({})

  // Use active trigger for positioning
  const targetRef = activeTrigger === 'btn1' ? trigger1Ref : trigger2Ref

  const {popoverProps} = usePopover(
    { triggerRef: targetRef, popoverRef },
    state
  )

  return (
    <>
      <button ref={trigger1Ref} onClick={() => {
        setActiveTrigger('btn1')
        state.open()
      }}>
        Trigger 1
      </button>

      <button ref={trigger2Ref} onClick={() => {
        setActiveTrigger('btn2')
        state.open()
      }}>
        Trigger 2
      </button>

      {state.isOpen && (
        <div {...popoverProps} ref={popoverRef}>
          Content positioned to {activeTrigger}
        </div>
      )}
    </>
  )
}
```

### Key Features
- ✅ Dynamic triggerRef switching
- ✅ Automatic repositioning when targetRef changes
- ✅ WeakMap for memory-safe trigger tracking
- ✅ ResizeObserver on trigger element
- ⚠️ Manual state management required
- ⚠️ No built-in trigger identification

### GitHub Issues

**Issue #5126 - Overlays/modals feedback**
- No easy hover trigger for popovers

**Discussion #5717 - Close Popover after opening other content**
- Challenges with Modal triggered by Button inside Popover

**Issue #4213 - Non-modal popover inside modals**
- Accessibility issues with nested overlays

**Files:** `/Users/segunadebayo/Documents/code/react-spectrum/packages/@react-aria/overlays/`

---

## 4. Mantine - ❌ No Native Support

**Status:** Event configuration, manual control

### Architecture

```typescript
// Menu: Single trigger with event types
export interface MenuProps {
  trigger?: 'click' | 'hover' | 'click-hover'  // Event type, not multiple triggers
  openDelay?: number
  closeDelay?: number
}

// Tooltip: Event configuration
export interface TooltipProps {
  events?: { hover: boolean; focus: boolean; touch: boolean }
  openDelay?: number
  closeDelay?: number
}

// Popover: Manual event wiring
<Popover opened={opened} onChange={setOpened}>
  <Popover.Target>
    <Button onMouseEnter={open} onMouseLeave={close}>
      Trigger
    </Button>
  </Popover.Target>
</Popover>
```

### Design Philosophy
- Single trigger per component instance
- Event types instead of multiple triggers
- Manual event handler wiring
- Controlled state management

### Interesting Pattern: Modal Stacking

```typescript
// Multiple modals via stack
const stack = useModalsStack(['delete', 'confirm', 'really-confirm'])

<Modal.Stack>
  <Modal {...stack.register('delete')}>
    <Button onClick={() => stack.open('confirm')}>Confirm</Button>
  </Modal>

  <Modal {...stack.register('confirm')}>
    Content...
  </Modal>
</Modal.Stack>
```

### Key Features
- ❌ No multiple triggers per instance
- ✅ Clean event configuration API
- ✅ Modal stacking with z-index management
- ✅ Delay coordination (TooltipGroup)

**Files:** `/Users/segunadebayo/Documents/code/mantine/packages/@mantine/core/src/components/{Menu,Popover,Tooltip}/`

---

## 5. Ariakit (Reakit v2) - ✅ Yes (hover/focus)

**Status:** Multiple disclosure/anchor elements supported

### Implementation

From changelog:
> Now supports multiple disclosure/anchor elements for the same contentElement (typically the popup element) when triggered by hover or focus. The disclosureElement and anchorElement states are set only upon interaction.

### API Pattern

```typescript
// Multiple disclosure elements
<PopoverProvider>
  <PopoverDisclosure id="trigger-1">Trigger 1</PopoverDisclosure>
  <PopoverDisclosure id="trigger-2">Trigger 2</PopoverDisclosure>

  <Popover>
    Content
  </Popover>
</PopoverProvider>
```

### GitHub Issues

**Discussion #1042 - Multiple Popovers**
- How to share content between multiple popovers
- Solution: Use same store for multiple disclosure elements

**Issue #4236 - Popover opens unexpectedly**
- Workaround: `toggleOnClick={false}` on PopoverDisclosure

**Issue #3754 - Composing Popover and Tooltip**
- Unexpected behavior when using both on same element

### Key Features
- ✅ Multiple disclosure elements
- ✅ State updates only on interaction
- ✅ Works with hover and focus triggers
- ⚠️ Primarily for hover/focus, not click
- ⚠️ Limited documentation on ID tracking

---

## 6. Headless UI (Tailwind) - ❌ No Native Support

**Status:** Single trigger, composition-based

### Architecture

```typescript
// Single trigger component
<Popover>
  <PopoverButton>Trigger</PopoverButton>  {/* SINGLE */}
  <PopoverPanel>Content</PopoverPanel>
</Popover>
```

### GitHub Issues

**Discussion #1926 - Dialog within Popover**
- Opening Dialog from Popover causes Popover to disappear
- Workaround: `unmount=false` on PopoverPanel

**Issue #1342 - Multiple clicks on PopoverButton**
- With `focus=true`, multiple clicks cause repeated opening

**Discussion #1564 - Multiple Dialog support**
- Only single or nested Dialogs supported, not multiple simultaneous

**Issue #427 - Close popover manually**
- Slots don't expose togglePopover function

### Limitations
- ❌ No multi-trigger API
- ❌ Limited manual control
- ❌ Nested overlay issues

### Workarounds
```typescript
// Controlled mode with custom logic
<Popover open={isOpen} onClose={() => setIsOpen(false)}>
  <button onClick={() => setIsOpen(!isOpen)}>Custom Trigger</button>
  <PopoverPanel static>Content</PopoverPanel>
</Popover>
```

---

## 7. Bootstrap - ⚠️ Multiple Event Types Only

**Status:** Multiple trigger events, not multiple elements

### Implementation

```html
<!-- Multiple trigger events on SAME element -->
<button
  data-bs-toggle="popover"
  data-bs-trigger="hover focus"  <!-- Space-separated events -->
>
  Hover or focus me
</button>
```

### GitHub Issues

**Issue #39010 - Triggers click and focus can't be combined**
- Setting `data-bs-trigger="click focus"` breaks click behavior
- Click doesn't close popover on second click

### Limitations
- ✅ Multiple event types (hover, focus, click)
- ❌ NOT multiple trigger elements
- ❌ Positioning issues with multiple events

---

## 8. Element UI (Vue) - ❌ Limited Support

**Issue #16462 - Popover can't support multiple triggers**
- Popover only supports single trigger by String
- Tooltip.js supports multiple triggers but Element doesn't

---

## Cross-Library Patterns Analysis

### Common Challenges

1. **Focus Management**
   - Which trigger should receive focus on close?
   - Most libraries fail to track the opening trigger
   - Radix: Always returns to last trigger
   - Solution needed: Track active trigger for focus restoration

2. **Positioning**
   - Which trigger to anchor content to?
   - React Aria: Dynamic targetRef (best approach)
   - Base UI: Active trigger element from registry
   - Solution: Position relative to active trigger, update on change

3. **Outside Click Detection**
   - Should all triggers be excluded?
   - Most libraries only exclude single trigger
   - Solution: Query selector for all triggers with shared identifier

4. **Trigger Identification**
   - How to identify which trigger was used?
   - Base UI: Explicit IDs + Map registry
   - React Aria: RefObject comparison
   - Radix: No identification (limitation)

### Successful Patterns

#### 1. **Explicit ID + Registry** (Base UI)
```typescript
// Pros: Clear, explicit, type-safe
// Cons: Requires ID management, React-specific

triggers: Map<string, { element: HTMLElement; getPayload?: () => Payload }>
```

#### 2. **Dynamic Reference** (React Aria)
```typescript
// Pros: Flexible, memory-safe (WeakMap)
// Cons: Manual state management

const targetRef = activeTrigger === 'btn1' ? trigger1Ref : trigger2Ref
```

#### 3. **Value-Based Tracking** (Our Zag Approach)
```typescript
// Pros: Framework-agnostic, simple, no DOM tracking
// Cons: Requires data attributes for querying

activeTriggerValue: string | null
getTriggerProps({ value: 'edit' })
```

---

## Recommendations for Zag.js

### What Zag Should Do

1. **Value-Based Identification** ✅
   - Track `activeTriggerValue` (string)
   - Pass value through events
   - No DOM element tracking in machine

2. **Data Attribute Linking** ✅
   - `data-ownedby` for all triggers
   - `data-trigger-value` for specific trigger
   - Enables DOM querying without refs

3. **Focus Management**
   - Store last focused trigger element ID
   - Focus restoration to correct trigger on close
   - Consider `aria-controls` relationships

4. **Positioning (for Popover, Tooltip, Hover Card)**
   - Use `data-trigger-value` to find active trigger element
   - Reposition when `activeTriggerValue` changes
   - Fallback to first trigger if no value

5. **Outside Click**
   - Query all triggers via `data-ownedby`
   - Exclude all from outside click detection
   - Works for mixed trigger types (button + context)

### What Zag Should Avoid

1. ❌ **DOM Element Tracking**
   - No trigger refs in machine state
   - Keeps machine framework-agnostic

2. ❌ **Payload Support**
   - Adds generic types complexity
   - Users can manage in userland
   - Keeps API simple

3. ❌ **Mandatory IDs**
   - Support both with and without value
   - Backward compatible

### Unique Advantages

Compared to other libraries, Zag's approach offers:

1. **Framework Agnostic**
   - No React refs or DOM tracking
   - Works across all frameworks

2. **Simple API**
   - Just a string value, no generics
   - Clean type signatures

3. **Flexible IDs**
   - Function form: `ids.trigger = (value) => ...`
   - Supports any ID pattern

4. **Menu Context Triggers**
   - Both button and context triggers
   - Single unified approach

---

## Conclusion

**No library has perfect multiple trigger support.** Most either:
- Don't support it at all (Radix, Headless UI, Mantine)
- Require manual workarounds (React Aria)
- Only support specific cases (Ariakit: hover/focus only)

**Base UI comes closest** with explicit IDs and registry, but it's React-specific.

**Zag's proposed approach** is:
- ✅ Simpler than Base UI (no DOM tracking)
- ✅ More explicit than React Aria (value-based)
- ✅ More flexible than others (function IDs)
- ✅ Framework-agnostic
- ✅ Backward compatible

**Key Insight:** Value-based tracking + data attributes = Best of both worlds

---

## References

- **Base UI:** `/Users/segunadebayo/Documents/code/base-ui/packages/react/src/popover/`
- **Radix UI:** GitHub Issues #2469, #2270, Discussion #1532
- **React Aria:** `/Users/segunadebayo/Documents/code/react-spectrum/packages/@react-aria/`
- **Mantine:** `/Users/segunadebayo/Documents/code/mantine/packages/@mantine/core/`
- **Ariakit:** GitHub Discussion #1042, CHANGELOG.md
- **Headless UI:** GitHub Discussion #1926, Issue #1564
- **Bootstrap:** GitHub Issue #39010
