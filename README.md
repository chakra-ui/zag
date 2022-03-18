# UI Machines

Finite state machines for accessible JavaScript components

- ✅ **Framework Agnostic:** Reuse component logic in any JavaScript framework
- ✅ **Accessible:** Components come with built-in accessibility considerations for DOM frameworks

## The problem

With the rise of design systems and component-driven development, there's an endless re-implementation of common
component patterns (Tabs, Menu, Modal, etc.) in multiple frameworks.

Most of these implementations seem to be fairly similar in spirit, the only difference is that they use framework
specific idioms (like `useEffect` in React.js). They tend to grow in complexity over time and often become hard to
understand, debug, improve or test.

## Solution

`UI Machines` is a lightweight solution that implements common component patterns using the state machine and XState
methodology.

## Installation

```sh
npm i --save @ui-machines/<component>

# or

yarn add @ui-machines/<component>
```

For framework specific solutions, we provide simple wrappers to help you consume the component state machines.

- ⚛️ `@ui-machines/react` - React hooks for consuming machines in React applications
- 💚 `@ui-machines/vue` - Vue composition for consuming machines in Vue applications
- 🎷 `@ui-machines/solid` - Solid.js utilities for consuming machines in Solid.js applications

## Examples

### React

```jsx
import * as toggle from "@ui-machines/toggle"
import { useMachine } from "@ui-machines/react"

function Example() {
  // if you need access to `state` or `send` from machine
  const [state, send] = useMachine(toggle.machine)

  // convert machine details into `DOM` props
  const api = toggle.connect(state, send)

  // consume into components
  return <button {...api.buttonProps}>Toggle me</button>
}
```

## Guiding Principles

- All component machine and tests are modelled according to the
  [WAI-ARIA authoring practices](https://www.w3.org/TR/wai-aria-practices/)
- Write cypress tests for every component based on the WAI-ARIA spec. **Regardless of the framework, users expect
  component patterns to work the same way!**
- All machines should be light-weight, simple, and easy to understand. Avoid using complex machine concepts like spawn,
  nested states, etc.

## Development Plans

The components to be built come from the the
[Aria Practices Design Patterns and Widgets](https://www.w3.org/TR/wai-aria-practices-1.2) and common application
widgets in the industry.

## Inspirations

- [Thoughts on Pure UI](https://rauchg.com/2015/pure-ui) - Guillermo Rauch
- [Material Components Web](https://github.com/material-components/material-components-web)
- Duplicate code in Chakra UI [React](https://chakra-ui.com/) and [Vue](https://vue.chakra-ui.com/) 😅

## Issues

Looking to contribute? Look for the **Good First Issue** label.

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding a 👍. This helps maintainers prioritize
what to work on.
