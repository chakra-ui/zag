export const heroCode = {
  react: {
    lang: "tsx",
    file: "menu.tsx",
    code: `
import * as menu from "@zag-js/menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
export function Menu() {
  const service = useMachine(menu.machine, { id: useId() })
  const api = menu.connect(service, normalizeProps)
  return (
    <>
      <button {...api.getTriggerProps()}>Actions</button>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          <li {...api.getItemProps({ value: "edit" })}>Edit</li>
          <li {...api.getItemProps({ value: "share" })}>Share</li>
        </ul>
      </div>
    </>
  )
}`,
  },
  vue: {
    lang: "html",
    file: "Menu.vue",
    code: `
<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { useMachine, normalizeProps } from "@zag-js/vue"
import { computed, useId } from "vue"

const service = useMachine(menu.machine, { id: useId() })
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">Actions</button>
  <div v-bind="api.getPositionerProps()">
    <ul v-bind="api.getContentProps()">
      <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
      <li v-bind="api.getItemProps({ value: 'share' })">Share</li>
    </ul>
  </div>
</template>`,
  },
  solid: {
    lang: "tsx",
    file: "menu.tsx",
    code: `
import * as menu from "@zag-js/menu"
import { useMachine, normalizeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
export function Menu() {
  const service = useMachine(menu.machine, { id: createUniqueId() })
  const api = createMemo(() => menu.connect(service, normalizeProps))
  return (
    <>
      <button {...api().getTriggerProps()}>Actions</button>
      <div {...api().getPositionerProps()}>
        <ul {...api().getContentProps()}>
          <li {...api().getItemProps({ value: "edit" })}>Edit</li>
          <li {...api().getItemProps({ value: "share" })}>Share</li>
        </ul>
      </div>
    </>
  )
}`,
  },
  svelte: {
    lang: "svelte",
    file: "Menu.svelte",
    code: `
<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { useMachine, normalizeProps } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>Actions</button>
<div {...api.getPositionerProps()}>
  <ul {...api.getContentProps()}>
    <li {...api.getItemProps({ value: "edit" })}>Edit</li>
    <li {...api.getItemProps({ value: "share" })}>Share</li>
  </ul>
</div>`,
  },
} as const

export type HeroFramework = keyof typeof heroCode

export const stepCode = {
  machine: `
const service = useMachine(menu.machine, {
  id: useId(),
  onSelect: (details) => setLast(details.value),
})

const api = menu.connect(service, normalizeProps)`,
  parts: `
<button {...api.getTriggerProps()}>Actions</button>
<div {...api.getPositionerProps()}>
  <ul {...api.getContentProps()}>
    {items.map((item) => (
      <li key={item} {...api.getItemProps({ value: item })}>
        {item}
      </li>
    ))}
  </ul>
</div>`,
}

export const withZag = `
export function Menu() {
  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: (details) => select(details.value),
  })
  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Actions</button>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          {items.map((item) => (
            <li key={item} {...api.getItemProps({ value: item })}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}`

export const withoutZag = `
export function Menu() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus()
  }, [open, active])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const last = items.length - 1
    const keys: Record<string, () => void> = {
      ArrowDown: () => setActive((i) => (i >= last ? 0 : i + 1)),
      ArrowUp: () => setActive((i) => (i <= 0 ? last : i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Escape: close,
      Enter: () => {
        select(items[active])
        close()
      },
    }
    if (!keys[event.key]) return
    event.preventDefault()
    keys[event.key]()
  }

  return (
    <div onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <button
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="actions-menu"
        onClick={() => setOpen(true)}
      >
        Actions
      </button>
      {open && (
        <ul id="actions-menu" role="menu" onKeyDown={onKeyDown}>
          {items.map((item, i) => (
            <li
              key={item}
              role="menuitem"
              tabIndex={-1}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              onClick={() => select(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}`

export const adapters = [
  {
    id: "react",
    code: `import { useMachine, normalizeProps } from "@zag-js/react"`,
  },
  {
    id: "vue",
    code: `import { useMachine, normalizeProps } from "@zag-js/vue"`,
  },
  {
    id: "solid",
    code: `import { useMachine, normalizeProps } from "@zag-js/solid"`,
  },
  {
    id: "svelte",
    code: `import { useMachine, normalizeProps } from "@zag-js/svelte"`,
  },
  {
    id: "preact",
    code: `import { useMachine, normalizeProps } from "@zag-js/preact"`,
  },
]

export const machineImport = `import * as menu from "@zag-js/menu"`

export const looks = {
  minimal: `
[data-menu-trigger] {
  border: 1px solid var(--line);
  border-radius: 6px;
}

[data-menu-content] {
  border: 1px solid var(--line);
  border-radius: 6px;
}

[data-menu-item][data-highlighted] {
  background: var(--muted);
}`,
  bold: `
[data-menu-trigger] {
  background: var(--fg);
  color: var(--bg);
  border-radius: 999px;
}

[data-menu-trigger][data-state="open"] {
  background: var(--accent);
}

[data-menu-content] {
  border: 2px solid var(--fg);
  box-shadow: 4px 4px 0 var(--fg);
}

[data-menu-item][data-highlighted] {
  background: var(--accent);
  color: var(--bg);
}`,
} as const

export type Look = keyof typeof looks
