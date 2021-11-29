---
title: Getting Started
---

# Getting Started

Framework agnostic components using Statecharts.

Build accessible UI components for your design system in React, Solid and Vue without sweating over the logic.

We believe that most widgets work and function the same way regardless of the framework they're built with. Don't
re-invent the wheel, let the machines do the work 😊.

- 🔥 Component machines come with pretty good accessibility baked in.
- 🦄 Works with any JS framework  that supports JSX & hooks.
- 🌳 Built using the latest ideas in Statecharts.
- 🧪 Well-tested components using Cypress.

## Integrating with Frameworks

UI Machines can be used within most reactive frameworks like Vue, React, Svelte and Solid. The easiest way to use state
machines in your components is by leveraging the `useMachine` and `useActor` hooks we provide for each framework.

### **Usage with React**

Using the machines within React is fairly straight forward. You'll need to:

- Install `@ui-machines/react`
- Import `useMachine` from the package

The machines were developed with React-first mindset. Well, mostly because the creator (Segun Adebayo) is more of React
freak, Lol.

Here's a sample code that consumes a toggle machine in React.

```jsx
import { useMemo } from "react"
import { useMachine } from "@ui-machines/react"
import * as Toggle from "@ui-machines/toggle"

export default function Toggle() {
  const [state, send] = useMachine(toggleMachine)
  const { buttonProps, isActive } = useMemo(() => Toggle.connect(state, send), [state])
  return <button {...buttonProps}>{isActive ? "On" : "Off"}</button>
}
```

> UI machines uses `valtio` behind the scenes to provide automatic render optimizations due to the `useSnapshot` hook
> used within the machine hook. [Learn more](https://github.com/pmndrs/valtio#react-via-usesnapshot)

### **Usage with Vue 3 (JSX)**

While you can use the UI machines in Vue without JSX, we recommend using JSX as a means to consume output of the
`connect` function. Here's what you need to do:

- Install `@ui-machines/vue` which provides the reactivity hook needed for vue.
- Import `useMachine` from the package
- Import and use `normalizeProps` to convert the JSX attributes to a format compatible with Vue.
- For TypeScript users, you can import and use `VuePropTypes` to get better TS experience for JSX attributes.

```jsx
import { computed, defineComponent } from "vue"
import * as Toggle from "@ui-machines/toggle"
import { useMachine, normalizeProps } from "@ui-machines/vue"

export default defineComponent({
  name: "Toggle",
  setup() {
    const [state, send] = useMachine(Toggle.machine)
    const connect = computed(() => Toggle.connect(state, send, normalizeProps))
    return () => {
      const { buttonProps, isActive } = connect.value
      return <button {...buttonProps}>{isActive ? "On" : "Off"}</button>
    }
  },
})
```

#### Why the need for `normalizeProps`?

Most JSX framework use a different naming convention for their JSX attributes. For example, in React, the keydown
listener property is`onKeyDown` while in vue the correct property is `onKeydown`. These little nuances between
frameworks is handled for you automatically.

### **Usage with Solid.js**

We love Solid.js and added support to use the machines in it. Here's what you need to do:

- Install `@ui-machines/solid`
- Import `useMachine` from the package
- Import and use `normalizeProps` to convert JSX attributes to a format compatible with Solid.js
- For TypeScript users, you can import and use `SolidPropTypes` to get better TS experience for JSX attributes.

```jsx
import { createMemo } from "solid-js"
import * as Toggle from "@ui-machines/toggle"
import { useMachine, normalizeProps } from "@ui-machines/solid"

export default function Toggle() {
  const [state, send] = useMachine(Toggle.machine)
  const { buttonProps, isActive } = createMemo(() => Toggle.connect(state, send))
  return <button {...buttonProps}>{isActive ? "On" : "Off"}</button>
}
```

The goal of UI machines is to help you abstract the interaction and accessible patterns into a statechart so you never
have to write them over and again.

Thanks for reading! Let's get started with the components and machines.
