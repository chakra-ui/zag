# Integrating with Frameworks

UI Machines can be used within most reactive frameworks like Vue, React, Svelte and Solid. The easiest way to use state
machines in your components is by leveraging the `useMachine` and `useActor` hooks we provide for each framework.

## Usage with React

```jsx
import { useMachine } from "@ui-machines/react"
import toggleMachine from "../path/to/machine"

function Toggle() {
  const [state, send] = useMachine(toggleMachine)
  return <button onClick={() => send("TOGGLE")}>{state.matches("inactive") ? "Off" : "On"}</button>
}
```

**Rendering Optimization** Since we use `valtio` behind the scene, you'll get render optimization for free. This means
that only the piece of the machine context that your component accesses will cause it to re-render.

To learn more, check valtio's [useSnapshot](https://github.com/pmndrs/valtio#react-via-usesnapshot)

## Usage with Vue

```jsx
import { useMachine } from "@ui-machines/vue"
import toggleMachine from "../path/to/machine"

export default defineComponent({
  name: "Toggle",
  setup() {
    const [state, send] = useMachine(toggleMachine)
    return () => <button onClick={() => send("TOGGLE")}>{state.matches("inactive") ? "Off" : "On"}</button>
  },
})
```

## Usage with Svelte (JSX)

// TODO

## Usage with Solid.js

// TODO
