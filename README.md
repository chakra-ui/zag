# UI Machines

Finite state machines for accessible JavaScript components

- ✅ **Framework Agnostic:** Reuse component logic in any JavaScript framework
- ✅ **Accessible:** Components come with built-in accessibility considerations
  for DOM frameworks
- ✅ **Test-Friendly:** With built-in helpers, you can test component
  interactions, roles and functionality

## The problem

With the rise of design systems and component-driven development, there's an
endless re-implementation of common component patterns (Tabs, Menu, Modal, etc.)
in multiple frameworks.

Most of these implementations seem to be fairly similar in spirit, the only
difference is that they use framework specific idioms (like `useEffect` in
React.js). They tend to grow in complexity over time and often become hard to
understand, debug, improve or test.

## Solution

`UI Machines` is a lightweight solution that implements common component
patterns using the state machine and XState methodology.

## Installation

```sh
npm i --save @ui-machines/core

# or

yarn add @ui-machines/core
```

For framework specific solutions, we provide simple wrappers to help you consume
the component state machines.

- ⚛️ `@ui-machines/react` - React hooks for consuming machines in React
  applications
- 💚 `@ui-machines/vue` - Vue composition for consuming machines in Vue
  applications
- 🎷 `@ui-machines/svelte` - Svelte utilities for consuming in Svelte
  applications
- ✅ `@ui-machines/test` - Testing utilities for component logic, accessibiltiy
  and interactions

## Examples

### React

```jsx
import { toggleMachine, connectToggleMachine } from "@ui-machines/dom"
import { useMachine } from "@ui-machines/react"

function Tabs() {
  // if you need access to `state` or `send` from machine
  const [state, send] = useMachine(toggleMachine)

  // convert machine details into `DOM` props
  const { getButtonProps } = connectToggleMachine(state, send)

  // consume into components
  return <button {...getButtonProps()}>Toggle me</button>
}
```

## Guiding Principles

- All component machine and tests are modelled according to the
  [WAI-ARIA authoring practices](https://www.w3.org/TR/wai-aria-practices/)
- Write test managers for both the
- All machines should be light-weight, simple, and easy to understand.
- Avoid using complex machine concepts like spawn, nested states, etc.

## Issues

Looking to contribute? Look for the [Good First Issue][good-first-issue] label.

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]
