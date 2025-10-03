# Zag.js Framework Integration Guide

This guide explains how to integrate Zag.js machines with different frameworks (React, Vue, Solid, Svelte) and how to
create examples for each framework.

## Overview

Zag.js provides framework-specific adapters that handle reactivity and prop normalization. Each framework uses:

- `useMachine()`: Hook/composable to consume the state machine
- `normalizeProps`: Framework-specific prop normalizer
- `connect()`: Generates framework-compatible element props

## Framework Integration Patterns

### React

**Location:** `packages/frameworks/react/src/`

**Key Exports:**

- `useMachine`: React hook for consuming machines
- `normalizeProps`: Converts to React props (className, onClick, etc.)
- `mergeProps`: Merge multiple prop objects

**Example:**

```tsx
import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(bottomSheet.machine, {
    id: useId(),
  })

  const api = bottomSheet.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Open</button>
      <div {...api.getBackdropProps()} />
      <div {...api.getContentProps()}>
        <div {...api.getGrabberProps()}>
          <div {...api.getGrabberIndicatorProps()} />
        </div>
        <div {...api.getTitleProps()}>Bottom Sheet</div>
      </div>
    </>
  )
}
```

**Key Points:**

- Use `useId()` from React for unique IDs
- `api` is stable and can be used directly (no memo needed)
- Props are spread with `{...api.getXProps()}`

### Vue (Nuxt)

**Location:** `packages/frameworks/vue/src/`

**Key Exports:**

- `useMachine`: Vue composable for consuming machines
- `normalizeProps`: Converts to Vue props
- `mergeProps`: Merge multiple prop objects

**Example:**

```vue
<script setup lang="ts">
import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(bottomSheet.machine, {
  id: useId(),
})

const api = computed(() => bottomSheet.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()">Open</button>
    <div v-bind="api.getBackdropProps()"></div>
    <div v-bind="api.getContentProps()">
      <div v-bind="api.getGrabberProps()">
        <div v-bind="api.getGrabberIndicatorProps()"></div>
      </div>
      <div v-bind="api.getTitleProps()">Bottom Sheet</div>
    </div>
  </main>
</template>
```

**Key Points:**

- Use `useId()` from Vue/Nuxt for unique IDs
- `api` must be wrapped in `computed()` for reactivity
- Props are bound with `v-bind="api.getXProps()"`
- Template uses v-for for loops: `v-for="(item, index) in items" :key="index"`

### Solid

**Location:** `packages/frameworks/solid/src/`

**Key Exports:**

- `useMachine`: Solid hook for consuming machines
- `normalizeProps`: Converts to Solid props
- `mergeProps`: Merge multiple prop objects from `@zag-js/solid`

**Example:**

```tsx
import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"

export default function Page() {
  const service = useMachine(bottomSheet.machine, {
    id: createUniqueId(),
  })

  const api = createMemo(() => bottomSheet.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>Open</button>
      <div {...api().getBackdropProps()} />
      <div {...api().getContentProps()}>
        <div {...api().getGrabberProps()}>
          <div {...api().getGrabberIndicatorProps()} />
        </div>
        <div {...api().getTitleProps()}>Bottom Sheet</div>
      </div>
    </>
  )
}
```

**Key Points:**

- Use `createUniqueId()` from Solid for unique IDs
- `api` must be wrapped in `createMemo()` for reactivity
- Access api with function call: `api().getXProps()`
- Use `<For>` component for loops: `<For each={items}>{(item, index) => <div>...</div>}</For>`

### Svelte

**Location:** `packages/frameworks/svelte/src/`

**Key Exports:**

- `useMachine`: Svelte function for consuming machines
- `normalizeProps`: Converts to Svelte props

**Example (Svelte 5 with Runes):**

```svelte
<script lang="ts">
  import * as bottomSheet from "@zag-js/bottom-sheet"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(bottomSheet.machine, { id })

  const api = $derived(bottomSheet.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()}>Open</button>
  <div {...api.getBackdropProps()}></div>
  <div {...api.getContentProps()}>
    <div {...api.getGrabberProps()}>
      <div {...api.getGrabberIndicatorProps()}></div>
    </div>
    <div {...api.getTitleProps()}>Bottom Sheet</div>
  </div>
</main>
```

**Key Points:**

- Use `$props.id()` or custom ID generation
- `api` is derived with `$derived()` (Svelte 5 runes)
- Props are spread with `{...api.getXProps()}`
- Use `{#each}` for loops: `{#each items as item, index} ... {/each}`

## Creating Examples for All Frameworks

When adding a new component or feature, you need to create examples in all framework directories.

### Example Directory Structure

```
examples/
├── next-ts/pages/           # React (Next.js)
│   ├── bottom-sheet.tsx
│   ├── bottom-sheet-snap-points.tsx
│   └── bottom-sheet-draggable-false.tsx
├── nuxt-ts/app/pages/       # Vue (Nuxt)
│   ├── bottom-sheet.vue
│   ├── bottom-sheet-snap-points.vue
│   └── bottom-sheet-draggable-false.vue
├── solid-ts/src/routes/     # Solid
│   ├── bottom-sheet.tsx
│   ├── bottom-sheet-snap-points.tsx
│   └── bottom-sheet-draggable-false.tsx
└── svelte-ts/src/routes/    # Svelte
    ├── bottom-sheet/+page.svelte
    ├── bottom-sheet-snap-points/+page.svelte
    └── bottom-sheet-draggable-false/+page.svelte
```

### Example Template Pattern

Each example follows this pattern:

1. **Import the machine and framework adapter**
2. **Set up controls for testing** (using `@zag-js/shared` controls)
3. **Initialize the machine with `useMachine`**
4. **Connect to get the API**
5. **Render the component**
6. **Add Toolbar with controls and state visualizer**

### React Example Template

```tsx
import * as component from "@zag-js/component"
import { normalizeProps, useMachine } from "@zag-js/react"
import { componentControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(componentControls)

  const service = useMachine(component.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = component.connect(service, normalizeProps)

  return (
    <>
      <main className="component">{/* Component markup */}</main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
```

### Vue Example Template

```vue
<script setup lang="ts">
import * as component from "@zag-js/component"
import { componentControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(componentControls)

const service = useMachine(
  component.machine,
  controls.mergeProps<component.Props>({
    id: useId(),
  }),
)

const api = computed(() => component.connect(service, normalizeProps))
</script>

<template>
  <main className="component">
    <!-- Component markup -->
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
```

### Solid Example Template

```tsx
import * as component from "@zag-js/component"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { componentControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(componentControls)

  const service = useMachine(
    component.machine,
    controls.mergeProps({
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => component.connect(service, normalizeProps))

  return (
    <>
      <main class="component">{/* Component markup */}</main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
```

### Svelte Example Template

```svelte
<script lang="ts">
  import * as component from "@zag-js/component"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { componentControls } from "@zag-js/shared"

  const controls = useControls(componentControls)

  const id = $props.id()
  const service = useMachine(
    component.machine,
    controls.mergeProps<component.Props>({
      id,
    }),
  )

  const api = $derived(component.connect(service, normalizeProps))
</script>

<main class="component">
  <!-- Component markup -->
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
```

### Naming Conventions

**File naming:**

- React: `component-name.tsx` (kebab-case)
- Vue: `component-name.vue` (kebab-case)
- Solid: `component-name.tsx` (kebab-case)
- Svelte: `component-name/+page.svelte` (directory with +page.svelte)

**Variations:**

- Base example: `component.tsx`
- Feature variations: `component-feature.tsx` (e.g., `bottom-sheet-snap-points.tsx`)

### Adding Controls

Controls come from `@zag-js/shared` and are defined in `shared/src/controls.ts`:

```typescript
export const componentControls = defineControls({
  open: { type: "boolean", defaultValue: false },
  modal: { type: "boolean", defaultValue: true },
  // ... more controls
})
```

To use controls in examples:

```typescript
// React
const controls = useControls(componentControls)
const service = useMachine(component.machine, {
  id: useId(),
  ...controls.context, // Spread controls into machine context
})

// Vue/Solid/Svelte
const controls = useControls(componentControls)
const service = useMachine(component.machine, controls.mergeProps({ id: useId() }))
```

### Framework-Specific Rendering Patterns

#### React

```tsx
// Conditional rendering
{
  api.open && <div>Content</div>
}

// Lists
{
  items.map((item, index) => <div key={index}>{item}</div>)
}
```

#### Vue

```vue
<!-- Conditional rendering -->
<div v-if="api.open">Content</div>

<!-- Lists -->
<div v-for="(item, index) in items" :key="index">{{ item }}</div>
```

#### Solid

```tsx
// Conditional rendering
<Show when={api().open}>
  <div>Content</div>
</Show>

// Lists
<For each={items()}>
  {(item, index) => <div>{item}</div>}
</For>
```

#### Svelte

```svelte
<!-- Conditional rendering -->
{#if api.open}
  <div>Content</div>
{/if}

<!-- Lists -->
{#each items as item, index}
  <div>{item}</div>
{/each}
```

## The Connect Pattern

The `connect()` function is where machines become framework-compatible components. It's defined in each machine's
`connect.ts` file.

### Connect Function Structure

```typescript
export function connect<T extends PropTypes>(service: ComponentService, normalize: NormalizeProps<T>): ComponentApi<T> {
  const { state, send, context, scope, prop } = service

  // Derive state
  const open = state.hasTag("open")
  const value = context.get("value")

  return {
    // Public API
    open,
    value,
    setValue(newValue) {
      context.set("value", newValue)
    },

    // Prop getters
    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        onClick() {
          send({ type: "OPEN" })
        },
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        id: dom.getContentId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
      })
    },
  }
}
```

### Normalize Props

The `normalize` parameter adapts props for each framework:

```typescript
// React: normalize.button() adds onClick, className, etc.
normalize.button({ onClick: () => {} })
// => { onClick: () => {}, type: "button" }

// Vue: v-bind compatible
normalize.button({ onClick: () => {} })
// => { onClick: () => {}, type: "button" }

// Solid: onXxx becomes on:xxx
normalize.button({ onClick: () => {} })
// => { "on:click": () => {}, type: "button" }
```

## Running Examples

### Start Development Server

```bash
# React (Next.js)
pnpm start-react

# Vue (Nuxt)
pnpm start-vue

# Solid
pnpm start-solid

# Svelte
pnpm start-svelte
```

### Access Examples

Once started, navigate to:

- React: `http://localhost:3000/bottom-sheet`
- Vue: `http://localhost:3000/bottom-sheet`
- Solid: `http://localhost:3000/bottom-sheet`
- Svelte: `http://localhost:5173/bottom-sheet`

## Testing Examples

E2E tests run against the React examples by default (see `playwright.config.ts`).

To test a specific framework:

```bash
# Run against React examples
pnpm e2e-react

# Run against Vue examples
pnpm e2e-vue

# Run against Solid examples
pnpm e2e-solid

# Run against Svelte examples
pnpm e2e-svelte
```

## Common Patterns Across Frameworks

### Controlled Components

All frameworks support controlled and uncontrolled patterns:

```typescript
// Uncontrolled (internal state)
const service = useMachine(component.machine, {
  defaultValue: "initial",
})

// Controlled (external state)
const [value, setValue] = useState("controlled")
const service = useMachine(component.machine, {
  value,
  onValueChange: ({ value }) => setValue(value),
})
```

### Event Handlers

```typescript
// React
<button onClick={() => api.setValue("new")}>

// Vue
<button @click="api.setValue('new')">

// Solid
<button onClick={() => api().setValue("new")}>

// Svelte
<button on:click={() => api.setValue('new')}>
```

### Portal/Teleport

Each framework has portal capabilities for rendering content elsewhere:

```tsx
// React
import { Portal } from "@zag-js/react"
<Portal><div>...</div></Portal>

// Vue
<Teleport to="body"><div>...</div></Teleport>

// Solid
<Portal><div>...</div></Portal>

// Svelte (built-in, no import needed)
<!-- Content is placed in DOM naturally -->
```

## Troubleshooting

### Common Issues

1. **API not reactive in Vue/Solid/Svelte**
   - Solution: Wrap with `computed()`, `createMemo()`, or `$derived()`

2. **Props not spreading correctly**
   - React: Use `{...api.getXProps()}`
   - Vue: Use `v-bind="api.getXProps()"`
   - Solid: Use `{...api().getXProps()}`
   - Svelte: Use `{...api.getXProps()}`

3. **Events not firing**
   - Check normalize function is passed to connect
   - Verify event handler naming (onClick vs on:click)

4. **TypeScript errors**
   - Ensure proper type imports: `import type { ComponentProps } from "@zag-js/component"`
   - Use framework-specific types: `PropTypes` from connect API
