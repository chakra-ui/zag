# Zag.js State Machine Guide

This guide explains how state machines work in Zag.js and how to create or modify them.

## Overview

Zag.js uses state machines created with `createMachine()` from `@zag-js/core`. Each machine defines the behavior and
state management for a UI component in a framework-agnostic way.

## Machine Structure

A Zag.js machine consists of several key sections:

```typescript
export const machine = createMachine<ComponentSchema>({
  props({ props, scope }) {
    /* ... */
  },
  context({ bindable, prop }) {
    /* ... */
  },
  refs() {
    /* ... */
  },
  computed: {
    /* ... */
  },
  watch({ track, action, prop }) {
    /* ... */
  },
  initialState({ prop }) {
    /* ... */
  },
  on: {
    /* global event handlers */
  },
  states: {
    /* state definitions */
  },
  implementations: {
    guards: {
      /* ... */
    },
    actions: {
      /* ... */
    },
    effects: {
      /* ... */
    },
  },
})
```

### 1. Props

The `props` function normalizes and sets default values for component props.

```typescript
props({ props, scope }) {
  const modal = typeof props.modal === "boolean" ? props.modal : true
  return {
    modal,
    trapFocus: modal,
    preventScroll: modal,
    closeOnInteractOutside: true,
    closeOnEscape: true,
    ...props, // User props override defaults
  }
}
```

**Key Points:**

- Always return defaults first, then spread user `...props` to allow overrides
- Use conditional logic for interdependent defaults
- The `scope` parameter provides access to DOM scope (id, ids, etc.)

### 2. Context (Bindable State)

Context holds the reactive state of the machine using the `bindable` pattern.

```typescript
context({ bindable, prop }) {
  return {
    dragOffset: bindable<number | null>(() => ({
      defaultValue: null,
    })),
    activeSnapPoint: bindable<number | string>(() => ({
      defaultValue: prop("defaultActiveSnapPoint"),
      value: prop("activeSnapPoint"), // Controlled value
      onChange(value) {
        return prop("onActiveSnapPointChange")?.({ snapPoint: value })
      },
    })),
  }
}
```

**Bindable Pattern:**

- `defaultValue`: Initial value for uncontrolled state
- `value`: Controlled value from props (optional)
- `onChange`: Callback when value changes

**Accessing Context:**

- Read: `context.get("dragOffset")`
- Write: `context.set("dragOffset", value)`
- Initial: `context.initial("dragOffset")`

### 3. Refs

Refs hold non-reactive references like class instances or DOM elements.

```typescript
refs() {
  return {
    dragManager: new DragManager(),
  }
}
```

**Accessing Refs:**

- `refs.get("dragManager")`

### 4. Computed

Computed values are derived from context and props.

```typescript
computed: {
  resolvedSnapPoints({ context, prop }) {
    const contentHeight = context.get("contentHeight")
    if (contentHeight === null) return []
    return prop("snapPoints").map((snapPoint) =>
      resolveSnapPoint(snapPoint, contentHeight)
    )
  },
}
```

**Accessing Computed:**

- `computed("resolvedSnapPoints")`

### 5. Watch

Watch tracks changes to props or context and triggers actions.

```typescript
watch({ track, action, prop }) {
  track([() => prop("open")], () => {
    action(["toggleVisibility"])
  })
}
```

**Key Points:**

- Use dependency array to specify what to track
- Call `action()` with action names to execute

### 6. States

States define the machine's finite states and transitions.

```typescript
states: {
  open: {
    tags: ["open"],
    entry: ["checkRenderedElements"], // Runs when entering state
    exit: ["cleanup"],                 // Runs when exiting state
    effects: [                          // Runs while in state (with cleanup)
      "trackDismissableElement",
      "trapFocus",
      "preventScroll",
    ],
    on: {
      CLOSE: [
        {
          guard: "isOpenControlled",
          actions: ["invokeOnClose"],
        },
        {
          target: "closed",
          actions: ["invokeOnClose"],
        },
      ],
      POINTER_DOWN: {
        actions: ["setPointerStart"],
      },
    },
  },
  closed: {
    tags: ["closed"],
    on: {
      OPEN: {
        target: "open",
        actions: ["invokeOnOpen"],
      },
    },
  },
}
```

**State Properties:**

- `tags`: Array of tags for easier state checking (e.g., `state.hasTag("open")`)
- `entry`: Actions that run when entering the state
- `exit`: Actions that run when exiting the state
- `effects`: Side effects that run while in state (must return cleanup function)
- `on`: Event handlers for this state

**Event Handlers:**

- Can be single transition or array of guarded transitions
- First matching guard wins
- `target`: Next state to transition to
- `actions`: Actions to execute during transition
- `guard`: Condition that must be true for transition

### 7. Initial State

Defines which state the machine starts in.

```typescript
initialState({ prop }) {
  const open = prop("open") || prop("defaultOpen")
  return open ? "open" : "closed"
}
```

### 8. Global Event Handlers

Events that work in any state.

```typescript
on: {
  "ACTIVE_SNAP_POINT.SET": {
    actions: ["setActiveSnapPoint"],
  },
}
```

### 9. Implementations

#### Guards

Guards are boolean conditions that determine if a transition should occur.

```typescript
guards: {
  isOpenControlled: ({ prop }) => prop("open") !== undefined,

  isDragging({ context }) {
    return context.get("dragOffset") !== null
  },

  shouldCloseOnSwipe({ prop, context, computed, refs }) {
    const dragManager = refs.get("dragManager")
    return dragManager.shouldDismiss(
      context.get("contentHeight"),
      computed("resolvedSnapPoints"),
      prop("swipeVelocityThreshold"),
      prop("closeThreshold"),
    )
  },
}
```

**Guard Parameters:**

- `prop`: Access props
- `context`: Access context state
- `refs`: Access refs
- `computed`: Access computed values
- `event`: Current event data
- `state`: Current state

#### Actions

Actions perform state updates and side effects.

```typescript
actions: {
  invokeOnOpen({ prop }) {
    prop("onOpenChange")?.({ open: true })
  },

  setDragOffset({ context, event, refs }) {
    const dragManager = refs.get("dragManager")
    dragManager.setDragOffset(event.point, context.get("resolvedActiveSnapPoint")?.offset || 0)
    context.set("dragOffset", dragManager.getDragOffset())
  },

  clearDragOffset({ context, refs }) {
    refs.get("dragManager").clearDragOffset()
    context.set("dragOffset", null)
  },
}
```

**Action Parameters:**

- Same as guards, plus:
- `send`: Send events to the machine
- `action`: Call other actions

#### Effects

Effects are side effects that run while in a state and must return a cleanup function.

```typescript
effects: {
  trackDismissableElement({ scope, prop, send }) {
    const getContentEl = () => dom.getContentEl(scope)
    return trackDismissableElement(getContentEl, {
      defer: true,
      onDismiss() {
        send({ type: "CLOSE", src: "interact-outside" })
      },
    })
  },

  preventScroll({ scope, prop }) {
    if (!prop("preventScroll")) return
    return preventBodyScroll(scope.getDoc())
  },

  trapFocus({ scope, prop }) {
    if (!prop("trapFocus")) return
    const contentEl = () => dom.getContentEl(scope)
    return trapFocus(contentEl, {
      preventScroll: true,
      returnFocusOnDeactivate: !!prop("restoreFocus"),
      initialFocus: prop("initialFocusEl"),
    })
  },
}
```

**Effect Requirements:**

- Must return a cleanup function (or undefined if no cleanup needed)
- Cleanup is called when exiting the state or unmounting
- Use for DOM event listeners, observers, subscriptions

## Best Practices

### 1. Keep Machines Simple

Avoid complex nested states, spawning, or advanced state machine features. Zag focuses on simple, predictable state
machines.

### 2. Use Bindable for State

All reactive state should use the `bindable` pattern in context. This ensures proper integration with all frameworks.

### 3. Separate Concerns

- **machine.ts**: State machine logic only
- **connect.ts**: Framework prop generation and DOM interactions
- **dom.ts**: DOM queries and element getters
- **types.ts**: TypeScript type definitions
- **anatomy.ts**: Component part definitions

### 4. Event Naming

Use SCREAMING_SNAKE_CASE for event names:

- `OPEN`, `CLOSE`, `TOGGLE`
- `POINTER_DOWN`, `POINTER_MOVE`, `POINTER_UP`
- `ACTIVE_SNAP_POINT.SET`

### 5. Controlled vs Uncontrolled

Support both patterns:

```typescript
// In props
open?: boolean           // Controlled
defaultOpen?: boolean    // Uncontrolled

// In context
activeSnapPoint: bindable<number | string>(() => ({
  defaultValue: prop("defaultActiveSnapPoint"),  // Uncontrolled
  value: prop("activeSnapPoint"),                // Controlled
  onChange(value) {
    return prop("onActiveSnapPointChange")?.({ snapPoint: value })
  },
}))

// In guards
isOpenControlled: ({ prop }) => prop("open") !== undefined

// In event handlers
OPEN: [
  {
    guard: "isOpenControlled",
    actions: ["invokeOnOpen"],  // Only invoke callback, don't transition
  },
  {
    target: "open",              // Transition and invoke callback
    actions: ["invokeOnOpen"],
  },
]
```

### 6. Accessibility First

Always include:

- Proper ARIA attributes (see connect.ts)
- Keyboard interactions
- Focus management (trapFocus, restoreFocus)
- Screen reader announcements

### 7. Clean Up Effects

Always return cleanup functions from effects:

```typescript
trackPointerMove({ scope, send }) {
  const doc = scope.getDoc()

  function onPointerMove(event: PointerEvent) {
    send({ type: "POINTER_MOVE", point: getEventPoint(event) })
  }

  const cleanup = addDomEvent(doc, "pointermove", onPointerMove)

  return () => {
    cleanup()
  }
}
```

### 8. Type Safety

Define comprehensive TypeScript schemas:

```typescript
export interface ComponentSchema {
  props: RequiredBy<ComponentProps, PropsWithDefault>
  state: "open" | "closed" | "closing"
  tag: "open" | "closed"
  context: {
    dragOffset: number | null
    activeSnapPoint: number | string
  }
  refs: {
    dragManager: DragManager
  }
  computed: {
    resolvedSnapPoints: ResolvedSnapPoint[]
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}
```

## Common Patterns

### Animation Exit State

For components with closing animations:

```typescript
states: {
  open: {
    on: {
      CLOSE: {
        target: "closing",  // Intermediate state
      },
    },
  },
  closing: {
    effects: ["trackExitAnimation"],
    on: {
      ANIMATION_END: {
        target: "closed",
        actions: ["cleanup"],
      },
    },
  },
  closed: {
    // ...
  },
}
```

### Controlled State Synchronization

Use watch to sync controlled props:

```typescript
watch({ track, action, prop }) {
  track([() => prop("open")], () => {
    action(["toggleVisibility"])
  })
}

// In actions
toggleVisibility({ event, send, prop }) {
  send({
    type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
    previousEvent: event
  })
}
```

### Computed Dependencies

Use context values in computed:

```typescript
computed: {
  resolvedSnapPoints({ context, prop }) {
    const contentHeight = context.get("contentHeight")
    if (contentHeight === null) return []
    return prop("snapPoints").map((snapPoint) =>
      resolveSnapPoint(snapPoint, contentHeight)
    )
  },
}
```

Then watch for changes:

```typescript
watch({ track, context }) {
  track([
    () => context.get("activeSnapPoint"),
    () => context.get("contentHeight")
  ], () => {
    const activeSnapPoint = context.get("activeSnapPoint")
    const contentHeight = context.get("contentHeight")
    if (contentHeight === null) return

    const resolved = resolveSnapPoint(activeSnapPoint, contentHeight)
    context.set("resolvedActiveSnapPoint", resolved)
  })
}
```

## Debugging

Enable debug logging by setting the `debug` property on the machine:

```typescript
const service = useMachine(bottomSheet.machine, {
  id: "bottom-sheet-1",
  debug: true, // Enable debug logging
})
```

This will log:

- State transitions
- Actions executed
- Events sent
- Initialization and cleanup
