---
name: zag
description:
  Builds accessible UI components with Zag.js state machines in React, Preact, Vue, Svelte or Solid. Covers picking a
  component, wiring a machine with useMachine, connect and its prop getters, controlled and default state, styling parts
  by data attribute, overlays and layering, forms, collections, and upgrading from Zag v1. Use whenever a project has
  @zag-js/* installed or the user mentions Zag or zagjs.
---

# Build with Zag

Zag is headless. Each component is a state machine plus a `connect` function that turns the machine's state into props.
You render your own elements and spread those props onto them. Zag adds no markup and no styles.

## Read the right docs

1. **Check the installed version** in `package.json`. For `@zag-js/*` 2.x, including `2.0.0-next.*`, the docs are at
   `https://v2.zagjs.com`. For 1.x they're at `https://zagjs.com`. Every `{docs}` below means that host.
2. **Find the component** in [references/components.md](references/components.md). Before writing any `role=` attribute,
   check there: a `role="listbox"`, `"menu"`, `"dialog"`, `"tablist"` or `"slider"` written by hand next to an installed
   Zag package is almost always a mistake.
3. **Read its page** at `{docs}/components/{framework}/{slug}.md`, where the framework is `react`, `vue`, `svelte` or
   `solid`. Preact uses the React page. Read only the pages the task needs.
4. **For its states and events**, read `{docs}/machines/{slug}.json`, the machine as JSON.

The types are the API: each package's `.d.ts` files, or its `src/*.types.ts` when the package links to source. Don't
read compiled JavaScript in `dist/`.

## The pattern

Every component works the same way:

```tsx
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const service = useMachine(select.machine, { id: useId(), collection })
const api = select.connect(service, normalizeProps)

<button {...api.getTriggerProps()}>{api.valueAsString || "Select"}</button>
```

1. `useMachine(machine, props)` starts the machine.
2. `connect(service, normalizeProps)` returns the `api`: state such as `api.open`, methods such as `api.setValue()`, and
   a `get{Part}Props()` for each part.
3. Spread each part's props onto the element for that part.

Each framework wires this a little differently. Read [references/frameworks.md](references/frameworks.md) before writing
Vue, Svelte, Solid or Preact.

## Rules

- **Give every machine a unique, stable `id`.** Use the framework's id helper: `useId()` in React, Preact and Vue,
  `$props.id()` in Svelte, `createUniqueId()` in Solid. Zag builds element ids and ARIA links from it.
- **Render every part the docs show, nested the same way.** A label part names the control. A positioner wraps popup
  content. A missing part breaks ARIA or positioning.
- **Merge your handlers with `mergeProps`** from the framework package. Writing `onClick` after the spread replaces
  Zag's handler and breaks the component.
- **Start with `default{X}`, or control with `{x}` and `on{X}Change`**, like `defaultValue`, or `value` with
  `onValueChange`. Change callbacks receive a details object, like `({ value })`, not the bare value.
- **Change state through the `api`**, like `api.setOpen(true)` or `api.setValue(["a"])`, not by sending events.
- **Style with data attributes.** Every part has `[data-{component}-{part}]`, and states add attributes such as
  `[data-state="open"]` and `[data-disabled]`. See [references/styling.md](references/styling.md).
- **Overlays need a portal and a `z-index` on the positioner**, never on the content. See
  [references/styling.md](references/styling.md#layering).
- **Forms need the hidden input part.** See [references/forms.md](references/forms.md).
- **Select, combobox, listbox and tree view take a collection**, not an `items` array. See
  [references/collections.md](references/collections.md).
- **Don't add ARIA or roles that Zag already sets.** Name controls with the label part, or `aria-label` when there's no
  visible text.
- **Don't write Zag v1 code in a v2 project.** Most models learned v1. Check
  [references/upgrading.md](references/upgrading.md) for what changed.

## When you're done

1. **Typecheck** with the project's checker: `tsc --noEmit`, `vue-tsc --noEmit` or `svelte-check`.
2. **Use it with a keyboard** in a browser: Tab to it, use the arrow keys, Enter, Space and Escape, and check that focus
   lands where you'd expect after opening and closing.
3. **Report** each command you ran and its result, anything you couldn't check, and anything the docs got wrong or left
   out.
