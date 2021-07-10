# UI Machines

State machines for accessible UI widgets defined in the WAI-ARIA spec.

After building a couple of state machines, I find this pattern is super helpful:

## `<component>.machine.ts`

This file holds the machine definition for component, the type definitions for
the `context` and `state`.

> Naming convention for the types: `<component>MachineState` and
> `<component>MachineContext`

```jsx
const counter = createMachine<CounterMachineState, CounterMachineContext>()
```

## `<component>.dom.ts`

This file contains the helper function you need to query the DOM for elements,
or measure dom elements.

We call this function the "dom". In most cases, we use this function to get the
`first`, `last`, `next`, `prev`, and `rect` of an element.

```jsx
function dom(ctx: CounterMachineContext) {
  return {
    getRectById(id: string) {},
    first: "...",
    last: "...",
  }
}
```

## `<component>.connect.ts`

This file contains the function we use to map the machine's `state` and `send`
functions to DOM attributes or props.

We call this function `connect<Component>Machine`.

At this point, we need to ensure we use the proper ARIA attributes as described
in the ARIA specification.

```jsx
function connectCounterMachine(state, send) {
  return {
    getIncProps() {
      return {
        type: "button",
        "data-value": state.context.value,
        onClick() {
          send("INC_CLICK")
        },
      }
    },
  }
}
```

## `<component>.utils.ts`

If needed, this file contains common js utilities that are needed for the
machine or connect files.

## Patterns

- Avoid using complex functionalities in Xstate such as `spawn` and `actorRefs`.
  They increase the mental load needed to understand the component and make the
  developer feel: "What the heck! I can just do my thing in React instead. Lol"

- If a machine needs to query the DOM to get an element, ensure the machine's
  context holds a reference to `ownerDocument`.

  We typically call this `doc`, so when you need to query the DOM, you can do:
  `context.doc.querySelectorAll(...)`.

  This useful in scenarios where the component is used within Iframe or in apps
  like electron. In framework land, when the component mounts, we'll ensure we
  save the owner document to context.

  ```jsx
  import { createMachine, preserve } from "@ui-machines/core"

  // 1. Create the machine context
  type MachineContext = {
    doc?: Document,
  }

  // 2. Create the machine and add an event for setting the owner document
  const machine = createMachine({
    states: {
      mounted: {
        on: {
          SET_DOCUMENT: {
            actions(context, event) {
              // we use `preserve` as the
              context.doc === preserve(event.ownerDocument)
            },
          },
        },
      },
    },
  })

  // 3. You can then use it to query the DOM
  const inputNode = context.doc?.querySelector("input[id=uid]")
  inputNode?.focus()
  ```

- Avoid using React `ref` in the machine because they're tied to React's
  paradigm and might not work well in Vue or Svelte.

  Prefer to use a combination of `context.doc`, `id` and `querySelector` to get
  an element's node.

  > Most framework ensures the `ref` (React), `this.$refs` (Vue) or `bind:this`
  > (Svelte) have the same identity as when you do `getElementById` or
  > `querySelector` so this should work just fine.
