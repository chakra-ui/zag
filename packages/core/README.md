# @zag-js/core

This package contains a minimal implementation of [XState FSM](https://github.com/statelyai/xstate) for **finite state
machines** with addition of extra features we need for our components.

## Features

- Finite states with optional nested (hierarchical) states
- Initial state
- Transitions (object or strings)
- Context
- Entry actions
- Exit actions
- Transition actions
- Effects
- Boolean guard helpers (`and`, `or`, `not`)

> Note: The core package is intentionally minimal. It doesn't include delayed transitions, interval scheduling, spawn
> helpers, or activities. Use actions/effects to perform side effects.

> To better understand the state machines, we strongly recommend going though the
> [xstate docs](https://xstate.js.org/docs/) and videos. It'll give you the foundations you need.

## Quick start

**Installation**

```bash
npm i @zag-js/core
# or
yarn add @zag-js/core
```

**Usage (machine):**

```js
import { createMachine } from "@zag-js/core"

const toggleMachine = createMachine({
  id: "toggle",
  initialState() {
    return "inactive"
  },
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } },
  },
})
```

**Usage (service via adapter):**

```js
import { createMachine } from "@zag-js/core"
import { VanillaMachine } from "@zag-js/vanilla"

const machine = createMachine({
  initialState() {
    return "inactive"
  },
  states: {
    inactive: { on: { TOGGLE: "active" } },
    active: { on: { TOGGLE: "inactive" } },
  },
})

const service = new VanillaMachine(machine)
service.start()

service.subscribe(() => {
  console.log(service.state.get())
})

service.send({ type: "TOGGLE" })
service.send({ type: "TOGGLE" })
service.stop()
```

### Nested states (dot notation)

```ts
import { createMachine } from "@zag-js/core"

const machine = createMachine({
  initialState() {
    return "dialog"
  },
  states: {
    dialog: {
      tags: ["overlay"],
      initial: "closed",
      states: {
        closed: { on: { OPEN: { target: "dialog.open" } } },
        open: { on: { CLOSE: { target: "dialog.closed" } } },
      },
      // parent-level transitions still work
      on: { RESET: { target: "dialog.closed" } },
    },
  },
})

// service.state.matches("dialog.open") === true when nested state is active
```

### State IDs and `#id` targets

Use `id` on a state node when you want to target it explicitly from anywhere in the machine.

```ts
import { createMachine } from "@zag-js/core"

const machine = createMachine({
  initialState() {
    return "dialog"
  },
  states: {
    dialog: {
      initial: "open",
      states: {
        focused: {
          id: "dialogFocused",
        },
        open: {
          initial: "idle",
          states: {
            idle: {
              on: {
                CLOSE: { target: "#dialogFocused" },
              },
            },
          },
        },
      },
    },
  },
})
```

Notes:

- `#id` targets resolve by state node `id` (XState-style).
- State IDs must be unique within a machine.

## API

### `createMachine(config, options)`

Creates a new finite state machine from the config.

| Argument  | Type               | Description                                 |
| --------- | ------------------ | ------------------------------------------- |
| `config`  | object (see below) | The config object for creating the machine. |
| `options` | object (see below) | The optional options object.                |

**Returns:**

A machine definition object consumed by framework adapters (React, Solid, Svelte, Vue, Preact, Vanilla) to create a
runtime service.

The machine config has this schema:

### Machine config

- `initialState` (function) - returns the machine's initial state value.
- `states` (object) - mapping of state names to state configs. Supports nested `states` and `initial` for child states.
- `on` (object) - optional global transitions available from any state.
- `context` (function) - returns bindable context fields.
- `computed` (object) - derived values based on context, props, refs.
- `entry` / `exit` / `effects` - root-level actions/effects.
- `implementations` (object) - lookup tables for `actions`, `guards`, `effects`.

### State config

- `on` (object) - an object mapping event types (keys) to [transitions](#transition-config)

### Transition config

String syntax:

- (string) - the state name to transition to.
  - Same as `{ target: stateName }`

Object syntax:

- `target` (string) - the state name to transition to.
- `actions` (Action | Action[]) - the [action(s)](#action-config) to execute when this transition is taken.
- `guard` (Guard) - the condition (predicate function) to test. If it returns `true`, the transition will be taken.

### Machine options

- `actions?` (object) - a lookup object for your string actions.
- `guards?` (object) - a lookup object for your string guards specified as `guard` in the machine.
- `activities?` (object) - a lookup object for your string activities.
- `delays?` (object) - a lookup object for your string delays used in `after` and `every` config.

### Action config

The action function to execute while transitioning from one state to another. It takes the following arguments:

- `context` (any) - the machine's current `context`.
- `event` (object) - the event that caused the action to be executed.
