# Zag.js Documentation Structure Guide

This guide explains the file structure and conventions used in Zag.js machine packages.

## Overview

Each machine package in Zag.js follows a consistent structure that separates concerns and makes the codebase maintainable. Understanding this structure is crucial for creating new components or modifying existing ones.

## Machine Package Structure

Every machine package follows this directory structure:

```
packages/machines/{component}/
├── src/
│   ├── {component}.anatomy.ts    # Component part definitions
│   ├── {component}.connect.ts    # Framework connection API
│   ├── {component}.dom.ts        # DOM utilities and queries
│   ├── {component}.machine.ts    # State machine definition
│   ├── {component}.types.ts      # TypeScript type definitions
│   ├── utils/                     # Component-specific utilities
│   │   └── *.ts
│   └── index.ts                   # Main exports
├── package.json
├── README.md
└── tsconfig.json
```

## File-by-File Breakdown

### 1. Anatomy File (`{component}.anatomy.ts`)

Defines the component's parts (elements) using the anatomy API.

**Purpose:**
- Declares all DOM elements that make up the component
- Generates consistent data attributes for styling and testing
- Creates type-safe part references

**Structure:**

```typescript
import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("bottom-sheet").parts(
  "content",
  "title",
  "trigger",
  "backdrop",
  "grabber",
  "grabberIndicator",
  "closeTrigger",
)

export const parts = anatomy.build()
```

**Key Points:**
- Component name should match the package name
- Part names should be descriptive and semantic
- Keep parts sorted alphabetically for consistency
- Common parts: `root`, `trigger`, `content`, `label`, `title`

**Generated Attributes:**

```typescript
parts.content.attrs
// => { "data-scope": "bottom-sheet", "data-part": "content" }
```

### 2. DOM File (`{component}.dom.ts`)

Contains DOM queries and element getters.

**Purpose:**
- Centralize all DOM-related operations
- Generate consistent element IDs
- Provide type-safe element queries

**Structure:**

```typescript
import type { Scope } from "@zag-js/core"
import { queryAll } from "@zag-js/dom-query"

// ID Generators
export const getContentId = (ctx: Scope) =>
  ctx.ids?.content ?? `bottom-sheet:${ctx.id}:content`

export const getTitleId = (ctx: Scope) =>
  ctx.ids?.title ?? `bottom-sheet:${ctx.id}:title`

export const getTriggerId = (ctx: Scope) =>
  ctx.ids?.trigger ?? `bottom-sheet:${ctx.id}:trigger`

// Element Getters
export const getContentEl = (ctx: Scope) =>
  ctx.getById(getContentId(ctx))

export const getTriggerEl = (ctx: Scope) =>
  ctx.getById(getTriggerId(ctx))

// Specialized Queries
export const getScrollEls = (scope: Scope) => {
  const els: Record<"x" | "y", HTMLElement[]> = { x: [], y: [] }

  const contentEl = getContentEl(scope)
  if (!contentEl) return els

  const nodes = queryAll(contentEl, "*")
  nodes.forEach((node) => {
    const y = node.scrollHeight > node.clientHeight
    if (y) els.y.push(node)

    const x = node.scrollWidth > node.clientWidth
    if (x) els.x.push(node)
  })

  return els
}
```

**Naming Conventions:**
- ID generators: `get{Part}Id(ctx: Scope)`
- Element getters: `get{Part}El(ctx: Scope)`
- Custom queries: Descriptive function names

**ID Format:**
```
{component}:{instance-id}:{part}
```

Example: `bottom-sheet:my-sheet-1:content`

**Custom IDs:**
Users can override IDs via the `ids` prop:

```typescript
useMachine(bottomSheet.machine, {
  id: "my-sheet",
  ids: {
    content: "custom-content-id",
  },
})
```

### 3. Types File (`{component}.types.ts`)

Defines all TypeScript types for the component.

**Purpose:**
- Type-safe props and API
- Document prop requirements and defaults
- Define internal types (schema, service, etc.)

**Structure:**

```typescript
import type { Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

// Change event details
export interface OpenChangeDetails {
  open: boolean
}

export interface SnapPointChangeDetails {
  snapPoint: number | string
}

// Element IDs (for customization)
export type ElementIds = Partial<{
  backdrop: string
  content: string
  trigger: string
  grabber: string
}>

// Component props
export interface BottomSheetProps
  extends DirectionProperty,
          CommonProperties {
  /**
   * The ids of the elements in the bottom sheet. Useful for composition.
   */
  ids?: ElementIds

  /**
   * Whether to trap focus inside the sheet when it's opened.
   * @default true
   */
  trapFocus?: boolean | undefined

  /**
   * Whether the bottom sheet is open.
   */
  open?: boolean | undefined

  /**
   * The initial open state of the bottom sheet.
   */
  defaultOpen?: boolean | undefined

  /**
   * Function called when the open state changes.
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
}

// Props with defaults (used in schema)
type PropsWithDefault =
  | "trapFocus"
  | "modal"
  | "closeOnEscape"

// Machine schema
export interface BottomSheetSchema {
  props: RequiredBy<BottomSheetProps, PropsWithDefault>
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

// Service types
export type BottomSheetService = Service<BottomSheetSchema>
export type BottomSheetMachine = Machine<BottomSheetSchema>

// Connect API
export interface BottomSheetApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the bottom sheet is open.
   */
  open: boolean

  /**
   * Function to open or close the menu.
   */
  setOpen: (open: boolean) => void

  // Prop getters
  getContentProps: () => T["element"]
  getTitleProps: () => T["element"]
  getTriggerProps: () => T["button"]
}
```

**Type Conventions:**

1. **Props Interface:** `{Component}Props`
   - Extend `CommonProperties` for shared props
   - Extend `DirectionProperty` for RTL support
   - Document all props with JSDoc
   - Mark optional props with `| undefined`

2. **Schema Interface:** `{Component}Schema`
   - Define `props`, `state`, `tag`, `context`, `refs`, `computed`
   - Use `RequiredBy` to mark props with defaults

3. **API Interface:** `{Component}Api<T extends PropTypes>`
   - Generic over `PropTypes` for framework compatibility
   - Expose public state and methods
   - Prop getters return `T["element"]` or `T["button"]`

4. **Detail Interfaces:** `{Action}Details`
   - Used for callback event details
   - Example: `OpenChangeDetails`, `ValueChangeDetails`

### 4. Machine File (`{component}.machine.ts`)

Contains the state machine definition.

**Purpose:**
- Define component behavior and state transitions
- Implement guards, actions, and effects
- Handle all business logic

See the [State Machine Guide](./state-machine-guide.md) for detailed information.

**Structure:**

```typescript
import { createMachine } from "@zag-js/core"
import * as dom from "./{component}.dom"
import type { {Component}Schema } from "./{component}.types"

export const machine = createMachine<{Component}Schema>({
  props({ props, scope }) {
    // Normalize props with defaults
    return { ...defaults, ...props }
  },

  context({ bindable, prop }) {
    // Define reactive state
    return { /* bindable values */ }
  },

  refs() {
    // Define non-reactive references
    return { /* refs */ }
  },

  computed: {
    // Define computed values
  },

  watch({ track, action, prop }) {
    // Watch for prop/context changes
  },

  initialState({ prop }) {
    // Determine initial state
    return "closed"
  },

  states: {
    // Define states and transitions
  },

  implementations: {
    guards: { /* guards */ },
    actions: { /* actions */ },
    effects: { /* effects */ },
  },
})
```

### 5. Connect File (`{component}.connect.ts`)

Connects the machine to framework-specific rendering.

**Purpose:**
- Generate framework-compatible element props
- Expose public API methods
- Handle DOM events and interactions

**Structure:**

```typescript
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./{component}.anatomy"
import * as dom from "./{component}.dom"
import type { {Component}Api, {Component}Service } from "./{component}.types"

export function connect<T extends PropTypes>(
  service: {Component}Service,
  normalize: NormalizeProps<T>,
): {Component}Api<T> {
  const { state, send, context, scope, prop } = service

  // Derive state
  const open = state.hasTag("open")
  const value = context.get("value")

  return {
    // Public API
    open,
    value,

    // Methods
    setOpen(nextOpen: boolean) {
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },

    setValue(newValue: string) {
      context.set("value", newValue)
    },

    // Prop getters
    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        type: "button",
        "aria-expanded": open,
        "data-state": open ? "open" : "closed",
        onClick() {
          send({ type: "TOGGLE" })
        },
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        role: "region",
        "aria-labelledby": dom.getTitleId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
      })
    },
  }
}
```

**Key Points:**

1. **Destructure Service:**
   ```typescript
   const { state, send, context, scope, prop } = service
   ```

2. **Derive State Early:**
   ```typescript
   const open = state.hasTag("open")
   const disabled = prop("disabled")
   ```

3. **Use Normalize:**
   - `normalize.element()` for div, span, etc.
   - `normalize.button()` for button elements
   - `normalize.input()` for input elements
   - `normalize.label()` for label elements

4. **Include Anatomy Parts:**
   ```typescript
   return normalize.element({
     ...parts.content.attrs,  // Always spread first
     // ... other props
   })
   ```

5. **Accessibility Attributes:**
   - ARIA roles and attributes
   - Data attributes for state (`data-state`, `data-disabled`)
   - Proper labeling and descriptions

### 6. Index File (`index.ts`)

Main export file for the package.

```typescript
export { anatomy } from "./bottom-sheet.anatomy"
export { connect } from "./bottom-sheet.connect"
export { machine } from "./bottom-sheet.machine"
export * as dom from "./bottom-sheet.dom"
export type * from "./bottom-sheet.types"
```

**Export Conventions:**
- Export `anatomy`, `connect`, `machine` as named exports
- Export `dom` utilities as namespace (`* as dom`)
- Export types with `type *` (TypeScript 4.5+)

### 7. Utils Directory

Component-specific utilities and helpers.

**Common Utilities:**

```
utils/
├── drag-manager.ts      # Drag/pointer tracking
├── format.ts            # Value formatting
├── parse.ts             # Value parsing
├── resolve-value.ts     # Value resolution
└── validators.ts        # Input validation
```

**Example: DragManager**

```typescript
export class DragManager {
  private startPoint: Point | null = null
  private offset: number = 0

  setPointerStart(point: Point) {
    this.startPoint = point
  }

  setDragOffset(point: Point, baseOffset: number) {
    if (!this.startPoint) return
    const deltaY = point.y - this.startPoint.y
    this.offset = Math.max(0, baseOffset + deltaY)
  }

  getDragOffset(): number {
    return this.offset
  }

  clearPointerStart() {
    this.startPoint = null
  }
}
```

## Package Configuration

### package.json

```json
{
  "name": "@zag-js/bottom-sheet",
  "version": "0.1.0",
  "description": "Core logic for the bottom sheet widget",
  "keywords": ["js", "machine", "xstate", "statechart", "bottom-sheet"],
  "author": "Segun Adebayo <sage@adebayosegun.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/chakra-ui/zag"
  },
  "sideEffects": false,
  "files": ["dist"],
  "scripts": {
    "build": "tsup"
  },
  "dependencies": {
    "@zag-js/core": "workspace:*",
    "@zag-js/types": "workspace:*",
    "@zag-js/anatomy": "workspace:*",
    "@zag-js/dom-query": "workspace:*"
  }
}
```

**Key Points:**
- Use workspace protocol for internal dependencies
- Mark as side-effect free: `"sideEffects": false`
- Include relevant keywords for discoverability

### tsconfig.json

```json
{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## File Naming Conventions

### General Rules

1. **kebab-case** for file names
2. **PascalCase** for types/interfaces
3. **camelCase** for variables/functions
4. **SCREAMING_SNAKE_CASE** for events

### Component Files

```
bottom-sheet.anatomy.ts     ✓ Correct
bottomSheet.anatomy.ts      ✗ Wrong
BottomSheet.anatomy.ts      ✗ Wrong
```

### Utility Files

```
drag-manager.ts             ✓ Correct
dragManager.ts              ✗ Wrong
DragManager.ts              ✗ Wrong
```

## Creating a New Component

Follow these steps to create a new component:

### 1. Generate Package Scaffold

```bash
pnpm generate-machine
# Follow prompts to create package structure
```

### 2. Define Anatomy

Start with `{component}.anatomy.ts`:

```typescript
import { createAnatomy } from "@zag-js/anatomy"

export const anatomy = createAnatomy("my-component").parts(
  "root",
  "trigger",
  "content",
)

export const parts = anatomy.build()
```

### 3. Define Types

Create `{component}.types.ts` with:
- Props interface
- Schema interface
- API interface
- Event detail interfaces

### 4. Create DOM Utilities

In `{component}.dom.ts`, add:
- ID generators for all parts
- Element getters
- Specialized queries if needed

### 5. Build the Machine

In `{component}.machine.ts`:
- Define props with defaults
- Set up context (bindable state)
- Create states and transitions
- Implement guards, actions, effects

### 6. Create Connect Function

In `{component}.connect.ts`:
- Derive state from machine
- Implement public methods
- Create prop getters with proper attributes

### 7. Add Tests

Create E2E tests in `e2e/{component}.e2e.ts`

### 8. Create Examples

Add examples for all frameworks:
- `examples/next-ts/pages/{component}.tsx`
- `examples/nuxt-ts/app/pages/{component}.vue`
- `examples/solid-ts/src/routes/{component}.tsx`
- `examples/svelte-ts/src/routes/{component}/+page.svelte`

### 9. Add Controls

Define controls in `shared/src/controls.ts`:

```typescript
export const myComponentControls = defineControls({
  open: { type: "boolean", defaultValue: false },
  disabled: { type: "boolean", defaultValue: false },
})
```

### 10. Update Exports

Ensure `index.ts` exports all public APIs

## Common Patterns

### Optional Parts

For parts that may not always exist:

```typescript
// In types
export interface MyComponentApi<T extends PropTypes> {
  // Optional getter
  getDescriptionProps?: () => T["element"]
}

// In connect
return {
  ...(hasDescription && {
    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(scope),
      })
    },
  }),
}
```

### Polymorphic Props

For elements that can be different types:

```typescript
// In connect
getTriggerProps() {
  return normalize.button({
    ...parts.trigger.attrs,
    type: "button",
    as: prop("triggerAsChild") ? "div" : undefined,
  })
}
```

### Nested Components

For components with sub-items:

```typescript
// In API
export interface TabsApi<T extends PropTypes> {
  getTriggerProps(props: TriggerProps): T["button"]
  getContentProps(props: ContentProps): T["element"]
}

// Usage
<button {...api.getTriggerProps({ value: "tab1" })}>
```

### Derived Props

Props that depend on context:

```typescript
getItemProps(props: ItemProps) {
  const selected = context.get("value") === props.value
  return normalize.element({
    ...parts.item.attrs,
    "data-selected": selected ? "" : undefined,
    "aria-selected": selected,
  })
}
```

## Best Practices

### 1. Consistent Structure

Every component follows the same file structure for predictability.

### 2. Type Everything

Use TypeScript for all files. No implicit `any`.

### 3. Document Props

Every prop should have JSDoc comments with:
- Description
- `@default` value if applicable
- Usage notes

### 4. Accessibility First

Always include proper ARIA attributes and keyboard interactions.

### 5. Test Comprehensively

Write E2E tests covering:
- Accessibility
- User interactions
- Edge cases

### 6. Framework Agnostic

Machine logic should never depend on framework specifics.

### 7. Performance

- Use `bindable` for reactive state
- Avoid unnecessary computations
- Clean up effects properly

## Summary

Zag.js components follow a consistent, well-organized structure:

- **anatomy.ts**: Define component parts
- **dom.ts**: DOM utilities and queries
- **types.ts**: TypeScript definitions
- **machine.ts**: State machine logic
- **connect.ts**: Framework integration
- **index.ts**: Public exports

This structure ensures:
- Clear separation of concerns
- Easy navigation and maintenance
- Consistent patterns across components
- Type safety throughout
- Framework-agnostic core logic
