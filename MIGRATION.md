# Migration Guide

- Initial and controlled values are now handled in the machine.

  - `defaultOpen` and `open`
  - `defaultValue` and `value`

- Pagination

  - `api.setCount` is removed in favor of explicitly setting the `count` prop.

- Machine

  - `activities` is now renamed to `effects`
  - prop, context and refs are now explicitly passed to the machine. Prior to this everything was pass to the `context`
    object.
  - The syntax for `watch` has changed significantly, refer to the new machines to learn how it works. It is somewhat
    similar to how `useEffect` works in react.
  - `createMachine` is just an identity function, it doesn't do anything. The machine work is now moved to the framework
    `useMachine` hook.
  - `useMachine` now returns a `service` object with `send`, `prop`, `context`, `computed` and `scope` properties. It no
    longer returns a tuple of `[state, send]`.

- Removed `useActor` hook in favor of `useMachine` everywhere.
- Removed `open.controlled` in favor of `defaultOpen` and `open` props.

## Avatar

### Before

```tsx
import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const [state, send] = useMachine(avatar.machine({ id: useId() }))
  const api = avatar.connect(state, send, normalizeProps)

  return (
    <main className="avatar">
      <div {...api.getRootProps()}>
        <span {...api.getFallbackProps()}>PA</span>
        <img {...api.getImageProps()} src="https://i.pravatar.cc/150?u=1" alt="avatar" />
      </div>
    </main>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 1007.3000000119209}
{phase: 'update', duration: 890.4000000357628}
```

### After

```tsx
import { normalizeProps, useMachine } from "@zag-js/react"
import * as avatar from "@zag-js/avatar"
import { useId } from "react"

export default function Demo() {
  const service = useMachine(avatar.machine, { id: useId() })
  const api = avatar.connect(service, normalizeProps)

  return (
    <main className="avatar">
      <div {...api.getRootProps()}>
        <span {...api.getFallbackProps()}>PA</span>
        <img {...api.getImageProps()} src="https://i.pravatar.cc/150?u=1" alt="avatar" />
      </div>
    </main>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 736.9999999403954}
{phase: 'update', duration: 1.899999976158142}
```

## Accordion

### Before

```tsx
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { accordionData } from "@zag-js/shared"
import { useId } from "react"
import { Profile } from "../components/profile"

function Accordion() {
  const [state, send] = useMachine(accordion.machine({ id: useId() }))
  const api = accordion.connect(state, send, normalizeProps)

  return (
    <main className="accordion">
      <div {...api.getRootProps()}>
        {accordionData.map((item) => (
          <div key={item.id} {...api.getItemProps({ value: item.id })}>
            <h3>
              <button {...api.getItemTriggerProps({ value: item.id })}>
                {item.label}
                <div {...api.getItemIndicatorProps({ value: item.id })}>{">"}</div>
              </button>
            </h3>
            <div {...api.getItemContentProps({ value: item.id })}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 2778.4999997913837}
{phase: 'update', duration: 2.3000000715255737}
```

### After

```tsx
import { normalizeProps, useMachine } from "@zag-js/react"
import * as avatar from "@zag-js/avatar"
import { useId } from "react"
import { accordionData } from "@zag-js/shared"

function Accordion() {
  const service = useMachine(accordionMachine, { id: useId() })
  const api = connect(service, normalizeProps)

  return (
    <main className="accordion">
      <div {...api.getRootProps()}>
        {accordionData.map((item) => (
          <div key={item.id} {...api.getItemProps({ value: item.id })}>
            <h3>
              <button {...api.getItemTriggerProps({ value: item.id })}>
                {item.label}
                <div {...api.getItemIndicatorProps({ value: item.id })}>{">"}</div>
              </button>
            </h3>
            <div {...api.getItemContentProps({ value: item.id })}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 1079.0000001490116}
```

## Collapsible

### Before

```tsx
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

function Collapsible() {
  const [state, send] = useMachine(collapsible.machine({ id: useId() }))
  const api = collapsible.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getTriggerProps()}>Collapsible Trigger</button>
      <div {...api.getContentProps()}>
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
          id est laborum. <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 834.4000000357628}
{phase: 'update', duration: 2.1999999284744263}
```

### After

```tsx
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

function Collapsible() {
  const service = useMachine(collapsible.machine, { id: useId() })
  const api = collapsible.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getTriggerProps()}>Collapsible Trigger</button>
      <div {...api.getContentProps()}>
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim
          id est laborum. <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 290.3000001013279}
```

## Dialog

### Before

```tsx
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"

function Dialog() {
  const [state, send] = useMachine(dialog.machine({ id: "1" }))
  const api = dialog.connect(state, send, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}> Click me</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 688.9000000357628}
{phase: 'update', duration: 2.0000000298023224}
```

### After

```tsx
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"

function Dialog() {
  const service = useMachine(dialog.machine, { id: "1" })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}> Click me</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 135.50000008940697}
```

## Editable

### Before

```tsx
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const [state, send] = useMachine(editable.machine({ id: useId(), value: "Hello World" }))
  const api = editable.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getAreaProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <span data-testid="preview" {...api.getPreviewProps()} />
      </div>
      <div {...api.getControlProps()}>
        {!api.editing && (
          <button data-testid="edit-button" {...api.getEditTriggerProps()}>
            Edit
          </button>
        )}
        {api.editing && (
          <>
            <button data-testid="save-button" {...api.getSubmitTriggerProps()}>
              Save
            </button>
            <button data-testid="cancel-button" {...api.getCancelTriggerProps()}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 1679.500000089407}
{phase: 'update', duration: 2.0000000298023224}
```

### After

```tsx
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(editable.machine, { id: useId(), defaultValue: "Hello World" })
  const api = editable.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getAreaProps()}>
        <input data-testid="input" {...api.getInputProps()} />
        <span data-testid="preview" {...api.getPreviewProps()} />
      </div>
      <div {...api.getControlProps()}>
        {!api.editing && (
          <button data-testid="edit-button" {...api.getEditTriggerProps()}>
            Edit
          </button>
        )}
        {api.editing && (
          <>
            <button data-testid="save-button" {...api.getSubmitTriggerProps()}>
              Save
            </button>
            <button data-testid="cancel-button" {...api.getCancelTriggerProps()}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 737.5999999940395}
```

## Tooltip

### Before

```tsx
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"

function Tooltip() {
  const [state, send] = useMachine(tooltip.machine({ id: useId() }))
  const api = tooltip.connect(state, send, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Hover me</button>
      {api.open && (
        <div {...api.getPositionerProps()}>
          <div className="tooltip-content" {...api.getContentProps()}>
            Tooltip
          </div>
        </div>
      )}
    </>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 797.7999999821186}
{phase: 'update', duration: 2.5999999940395355}
```

### After

```tsx
import { normalizeProps, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"

function Tooltip() {
  const service = useMachine(tooltip.machine, { id: useId() })
  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Hover me</button>
      {api.open && (
        <div {...api.getPositionerProps()}>
          <div className="tooltip-content" {...api.getContentProps()}>
            Tooltip
          </div>
        </div>
      )}
    </>
  )
}
```

Mount Performance

```sh
{phase: 'mount', duration: 139.9000000357628}
```

## Presence

### Before

```tsx
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

function Presence() {
  const [present, setPresent] = useState(false)
  const context: presence.Context = { present }
  const [state, send] = useMachine(presence.machine(context), {
    context,
  })
  const api = presence.connect(state, send, normalizeProps)

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.present && (
        <div
          ref={(node) => {
            api.setNode(node)
          }}
          data-scope="presence"
          data-state={present ? "open" : "closed"}
        >
          Content
        </div>
      )}
    </main>
  )
}
```

Mount Performance

```sh
{ phase: "mount", duration: 1414 }
{ phase: "update", duration: 0 }
```

### After

```tsx
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

function Presence() {
  const [present, setPresent] = useState(false)
  const service = useMachine(machine, { present })
  const api = connect(service, normalizeProps)

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.present && (
        <div
          ref={(node) => {
            api.setNode(node)
          }}
          data-scope="presence"
          data-state={present ? "open" : "closed"}
        >
          Content
        </div>
      )}
    </main>
  )
}
```

Mount Performance

```sh
{ phase: "mount", duration: 502 }
```

## Tabs

### Before

```tsx
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

function Presence() {
  const [present, setPresent] = useState(false)
  const context: presence.Context = { present }
  const [state, send] = useMachine(presence.machine(context), {
    context,
  })
  const api = presence.connect(state, send, normalizeProps)

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.present && (
        <div
          ref={(node) => {
            api.setNode(node)
          }}
          data-scope="presence"
          data-state={present ? "open" : "closed"}
        >
          Content
        </div>
      )}
    </main>
  )
}
```

Mount Performance

```sh
{ phase: "mount", duration: 4120 }
{ phase: "update", duration: 2014 }
```

### After

```tsx
import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

function Presence() {
  const [present, setPresent] = useState(false)
  const service = useMachine(machine, { present })
  const api = connect(service, normalizeProps)

  return (
    <main className="presence">
      <button onClick={() => setPresent((c) => !c)}>Toggle</button>
      {api.present && (
        <div
          ref={(node) => {
            api.setNode(node)
          }}
          data-scope="presence"
          data-state={present ? "open" : "closed"}
        >
          Content
        </div>
      )}
    </main>
  )
}
```

Mount Performance

```sh
{ phase: "mount", duration: 3880 }
{ phase: "nested-update", duration: 3179 }
```
