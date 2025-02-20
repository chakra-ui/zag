# Migration Guide

## Fixed

- **Menu**

  - Fix issue where context menu doesn't update positioning on subsequent right clicks.

- **Avatar**

  - Fix issue where `api.setSrc` doesn't work.

## Removed

- General

  - Removed `useActor` hook in favor of `useMachine` everywhere.
  - Removed `open.controlled` in favor of `defaultOpen` and `open` props.

- Pagination

  - `api.setCount` is removed in favor of explicitly setting the `count` prop.

- Select, Combobox

  - `api.setCollection` is removed in favor of explicitly setting the `collection` prop.

## Changed

### Typings

- `<component>.Context` is now renamed to `<component>.Props`

Before:

```tsx
import * as accordion from "@zag-js/accordion"

interface Props extends accordion.Context {}
```

After:

```tsx
import * as accordion from "@zag-js/accordion"

interface Props extends accordion.Props {}
```

### `useMachine`

`useMachine` now returns a `service` object instead of a tuple of `[state, send]`.

This change is the same across all components.

Before:

```tsx
const [state, send] = useMachine(avatar.machine({ id: useId() }))
```

After:

```tsx
const service = useMachine(avatar.machine, { id: useId() })
```

> Notice that `avatar.machine` is no longer a function, it's an object.

### Controlled vs uncontrolled values

- Initial and controlled values are now handled in the machine.

  - `defaultOpen` and `open`
  - `defaultValue` and `value`

### Toast

// TODO: Add toast migration guide

## Performance

We measured the mount performance of 10k instances of each component, and compared the before and after.

### Avatar

**Result**: ~27% faster mount time and ~99% faster update time

#### Before

```sh
{phase: 'mount', duration: 1007.3000000119209}
{phase: 'update', duration: 890.4000000357628}
```

#### After

```sh
{phase: 'mount', duration: 736.9999999403954}
{phase: 'update', duration: 1.899999976158142}
```

## Accordion

**Result**: ~61% faster mount time and no update time

### Before

```sh
{phase: 'mount', duration: 2778.4999997913837}
{phase: 'update', duration: 2.3000000715255737}
```

### After

```sh
{phase: 'mount', duration: 1079.0000001490116}
```

## Collapsible

**Result**: ~65% faster mount time and no update time

### Before

```sh
{phase: 'mount', duration: 834.4000000357628}
{phase: 'update', duration: 2.1999999284744263}
```

### After

```sh
{phase: 'mount', duration: 290.3000001013279}
```

## Dialog

**Result**: ~80% faster mount time and no update time

### Before

```sh
{phase: 'mount', duration: 688.9000000357628}
{phase: 'update', duration: 2.0000000298023224}
```

### After

```sh
{phase: 'mount', duration: 135.50000008940697}
```

## Editable

**Result**: ~56% faster mount time and no update time

### Before

```sh
{phase: 'mount', duration: 1679.500000089407}
{phase: 'update', duration: 2.0000000298023224}
```

### After

```sh
{phase: 'mount', duration: 737.5999999940395}
```

## Tooltip

**Result**: ~82% faster mount time and no update time

### Before

```sh
{phase: 'mount', duration: 797.7999999821186}
{phase: 'update', duration: 2.5999999940395355}
```

### After

```sh
{phase: 'mount', duration: 139.9000000357628}
```

## Presence

**Result**: ~64% faster mount time and eliminated update time

### Before

```sh
{ phase: "mount", duration: 1414 }
{ phase: "update", duration: 0 }
```

### After

```sh
{ phase: "mount", duration: 502 }
```

## Tabs

**Result**: ~6% faster mount time

### Before

```sh
{ phase: "mount", duration: 4120 }
{ phase: "update", duration: 2014 }
```

### After

```sh
{ phase: "mount", duration: 3880 }
{ phase: "nested-update", duration: 3179 }
```

## Maintainers Notes

- Machine

  - `activities` is now renamed to `effects`
  - prop, context and refs are now explicitly passed to the machine. Prior to this everything was pass to the `context`
    object.
  - The syntax for `watch` has changed significantly, refer to the new machines to learn how it works. It is somewhat
    similar to how `useEffect` works in react.
  - `createMachine` is just an identity function, it doesn't do anything. The machine work is now moved to the framework
    `useMachine` hook.
