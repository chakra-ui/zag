# Frameworks

The machine and `connect` are the same in every framework. What changes is how you make an id, keep `api` up to date,
portal popups and pass props that change over time.

| Framework | Package          | Id                            | `api`                                             | Portal                             |
| --------- | ---------------- | ----------------------------- | ------------------------------------------------- | ---------------------------------- |
| React     | `@zag-js/react`  | `useId()`                     | `connect(...)` in the render                      | `Portal` from `@zag-js/react`      |
| Preact    | `@zag-js/preact` | `useId()` from `preact/hooks` | `connect(...)` in the render                      | `Portal` from `@zag-js/preact`     |
| Vue       | `@zag-js/vue`    | `useId()` from `vue`          | `computed(() => connect(...))`                    | Vue's `<Teleport to="body">`       |
| Svelte 5  | `@zag-js/svelte` | `$props.id()`                 | `$derived(connect(...))`                          | `use:portal` from `@zag-js/svelte` |
| Solid 2   | `@zag-js/solid`  | `createUniqueId()`            | `createMemo(() => connect(...))`, read as `api()` | `Portal` from `@solidjs/web`       |

## React and Preact

```tsx
import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"

export function CountrySelect({ items }) {
  const collection = select.collection({ items, itemToValue: (i) => i.code, itemToString: (i) => i.name })
  const service = useMachine(select.machine, { id: useId(), collection })
  const api = select.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Country</label>
      <button {...api.getTriggerProps()}>{api.valueAsString || "Select a country"}</button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Portal>
    </div>
  )
}
```

- Props passed to `useMachine` are read on every render, so `value: props.value` stays in sync.
- Preact is the same, with `useId` from `preact/hooks` and everything else from `@zag-js/preact`.

## Vue

```vue
<script setup lang="ts">
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, useId } from "vue"

const props = defineProps<{ items: Country[] }>()
const id = useId()
const collection = computed(() =>
  select.collection({ items: props.items, itemToValue: (i) => i.code, itemToString: (i) => i.name }),
)
const service = useMachine(
  select.machine,
  computed(() => ({ id, collection: collection.value })),
)
const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">Country</label>
    <button v-bind="api.getTriggerProps()">{{ api.valueAsString || "Select a country" }}</button>
    <Teleport to="body">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <ul v-bind="api.getListProps()">
            <li v-for="item in items" :key="item.code" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>
```

- Pass props that change as a `computed` (or a function returning the props), or the machine never sees the update.
- Spread with `v-bind`. `normalizeProps` already turns `onClick` into Vue's event names.

## Svelte 5

```svelte
<script lang="ts">
  import * as select from "@zag-js/select"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  let { items } = $props()
  const id = $props.id()
  const service = useMachine(select.machine, () => ({
    id,
    collection: select.collection({ items, itemToValue: (i) => i.code, itemToString: (i) => i.name }),
  }))
  const api = $derived(select.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>Country</label>
  <button {...api.getTriggerProps()}>{api.valueAsString || "Select a country"}</button>
  <div use:portal {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <ul {...api.getListProps()}>
        {#each items as item (item.code)}
          <li {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.name}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>
```

- Pass a function that returns the props when any of them change over time.
- `api` must be `$derived`, or the markup won't update.

## Solid 2

```tsx
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Portal } from "@solidjs/web"
import { createMemo, createUniqueId, For } from "solid-js"

export function CountrySelect(props) {
  const service = useMachine(select.machine, () => ({
    id: createUniqueId(),
    collection: select.collection({ items: props.items, itemToValue: (i) => i.code, itemToString: (i) => i.name }),
  }))
  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>Country</label>
      <button {...api().getTriggerProps()}>{api().valueAsString || "Select a country"}</button>
      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <ul {...api().getListProps()}>
              <For each={props.items}>
                {(item) => (
                  <li {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item.name}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </Portal>
    </div>
  )
}
```

- Zag v2 targets Solid 2. Import `Portal` from `@solidjs/web`, not `solid-js/web`.
- Pass a function that returns the props, and read `api()` as a call everywhere.
- Solid 2 has no `<Index>`. Use `<For keyed={false}>` instead; its callback then receives an accessor, so read `item()`.

## Your own handlers

Spread first, then merge. Writing a handler after the spread replaces Zag's.

```tsx
import { mergeProps } from "@zag-js/react"

;<button {...mergeProps(api.getTriggerProps(), { onClick: track })} />
```

`mergeProps` is exported by every framework package. It calls both handlers and merges `className`/`class` and `style`.
