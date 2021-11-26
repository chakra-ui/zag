## Installation

To use the accordion machine in your project, install the respective package

```jsx
import * as Accordion from "@ui-machines/accordion"
```

### Features

✅ Full keyboard navigation.

✅ Can expand one or multiple items.

✅ Can be controlled or uncontrolled.

If you're using React, you'll also need to install the `@ui-machines/react` binding

```jsx
// Provides all the logic for the accordion widget
import * as Accordion from "@ui-machines/accordion"

// start:react

// Provides the reactive binding for React
import { useMachine } from "@ui-machines/react"

// start:vue

// Provides the reactive binding for Vue
import { useMachine } from "@ui-machines/vue"

// start:solid-js

// Provides the reactive binding for Vue
import { useMachine } from "@ui-machines/solid"
```

Bringing it all together. The accordion package exports two key artifacts:

- `machine`: The state machine logic for the accordion widget as described in WAI-ARIA specification.
- `connect`: The function that translates the machine's state to DOM attributes and event handlers.

```jsx
import * as Accordion from "@ui-machines/accordion"
import { useMachine } from "@ui-machines/react"

function Accordion() {
  // invoke the machine within react
  const [state, send] = useMachine(Accordion.machine)

  // translate machine output to DOM attributes
  const bind = useMemo(() => Accordion.connect(state, send), [state])

  // render UI
  return (
    <div {...bind.rootProps}>
      <h3>
        <button {...bind.getTriggerProps({ value: "home" })}>Home Trigger</button>
      </h3>
      <div {...bind.getPanelProps({ value: "home" })}>Home Content</div>

      <h3>
        <button {...bind.getTriggerProps({ value: "about" })}>About Trigger</button>
      </h3>
      <div {...bind.getPanelProps({ value: "about" })}>About Content</div>
    </div>
  )
}
```

## Opening multiple accordions at once

To allow multiple items to be expanded at once, set `multiple` to `true`. This mode implicitly sets `collapsible` to
`true` to also ensure that each accordion can be expanded.

```jsx
const [state, send] = useMachine(Accordion.machine, {
  context: { multiple: true },
})
```

## Opening specific accordions

To set the value of the accordion(s) that should be opened initially, use the `withContext(...)` pattern and pass the
`value` attribute.

```jsx
// for multiple accordions
const [state, send] = useMachine(
  Accordion.machine.withContext({
    multiple: true,
    value: ["home"],
  }),
)

// for single accordions
const [state, send] = useMachine(
  Accordion.machine.withContext({
    value: "home",
  }),
)
```

## Controlling accordion state via props

The `useMachine` hook provides a way to pass **controlled** context into the machine, making it easier to
programmatically control the machine's behavior or context.

```jsx
function Accordion({ multiple }) {
  // controlled pattern
  const [state, send] = useMachine(Accordion.machine, {
    context: { multiple },
  })

  // uncontrolled pattern
  const [state, send] = useMachine(Accordion.machine.withContext({ multiple }))
}

function Example() {
  return <Accordion multiple />
}
```

> If you only need to set the accordion's context initially you can use the `Accordion.machine.withContext({...})`
> pattern. It won't respond to updates afterwards.

## Styling the expanded state

When an accordion item is expanded, a `data-expanded` attribute is set on the accordion trigger element. When it closes,
the `data-expanded` attribute is removed.

```css
.accordion-trigger {
  background: white;
}

/* Styling the expanded state */
.accordion-trigger[data-expanded] {
  background: red;
}
```

> The style above assumes that you passed `.accordion-trigger` classname to the accordion trigger button element.
