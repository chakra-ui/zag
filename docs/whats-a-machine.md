# What's a machine

A component machine is a behavior model of the component's logic and interactions. The machine is built based on the
premise that a component has a finite number of states it can be in, and state changes can only happen based on events
or interactions.

State machines has been popularly known as a tool to model complex business model. In this case, the "business" is
"components". Machines makes it easier to model and manage complex components logic.

The basic building blocks of a state machine are states and transitions.

## Example of State machine

Consider a simple toggle or switch component that consists of two states, `Active` and `Inactive`. The initial state
will be `Active`

The supported transitions that can happen here:

- In the `Active` state:
  - When we click the toggle, it should transition to the `Inactive` state
- In the `Inactive` state:
  - When we click the toggle, it should transition to the `Active` state

Here's how we'll model the logic in code:

```jsx
import { createMachine } from "@ui-machines/core"

const toggleMachine = createMachine({
  // initial state
  initial: "Active",
  // the finite states
  states: {
    Active: {
      CLICK: {
        // go to inactive
        target: "Inactive",
      },
    },
    Inactive: {
      CLICK: {
        // go to active
        target: "Active",
      },
    },
  },
})
```

The `toggleMachine` gives you access to these key information:

- `state`: State is an representation of the machine at a specific point in time and contains the following properties:

  - `value`: the current state value
  - `context`: the current context or data stored in the machine
  - `event`: the event object that triggered the transition of this current state
  - `matches(...)`: the function to check whether the machine is in a specific state. It's similar to
    `state.value === <state>`

- `send`: A function to send events or signals to the machine.

Now that we've modelled the component logic, let's map that to DOM attributes and event handlers. Let's follow the
[WAI-ARIA](https://www.w3.org/TR/wai-aria-practices/examples/checkbox/checkbox-1/checkbox-1.html) specification for the
switch component.

We'll write a function called `toggleConnect` to do this.

```jsx
function toggleConnect(state, send) {
  const isActive = state.matches("Active")
  return {
    isActive,
    buttonProps: {
      type: "button",
      role: "switch",
      "aria-checked": isActive,
      onClick() {
        send("CLICK")
      },
    },
  }
}
```

Here's how to consume the toggle machine logic and connect in React.js.

```jsx
import { useMachine } from "@ui-machines/react"
import { toggleMachine, toggleConnect } from "./toggle"

function Toggle() {
  const [state, send] = useMachine(toggleMachine)
  const { buttonProps, isActive } = toggleConnect(state, send)
  return (
    <button
      {...buttonProps}
      style={{
        width: "40px",
        height: "24px",
        borderRadius: "999px",
        background: isActive ? "green" : "gray",
      }}
    >
      {isActive ? "ON" : "OFF"}
    </button>
  )
}
```

That's it! Now you've learned the fundamentals of a component state machine. To learn more about the others features
liek guards, actions, activities, delayed transitions, you can go here [advanced](/advanced-concepts)
