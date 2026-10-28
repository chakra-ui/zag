import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../../styles/machines/collapsible.module.css"
import { Ghost, Log, Stack } from "./shared"

function useCollapsible(props: Partial<collapsible.Props> = {}) {
  const service = useMachine(collapsible.machine, { id: useId(), ...props })
  return collapsible.connect(service, normalizeProps)
}

interface ViewProps {
  api: collapsible.Api
  label?: string
  children?: React.ReactNode
}

function View(props: ViewProps) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        {props.label ?? "Release notes"}
        <span className={styles.Indicator} {...api.getIndicatorProps()}>
          ▾
        </span>
      </button>
      <div className={styles.Content} {...api.getContentProps()}>
        {props.children ?? (
          <p>
            Version 2.4 adds keyboard shortcuts for every action, a compact
            density setting and faster search across all projects.
          </p>
        )}
      </div>
    </div>
  )
}

export function CollapsibleInitialOpen() {
  const api = useCollapsible({ defaultOpen: true })
  return <View api={api} />
}

export function CollapsibleControlled() {
  const [open, setOpen] = useState(false)
  const api = useCollapsible({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <Ghost onClick={() => setOpen((current) => !current)}>
        {open ? "Close" : "Open"} from outside
      </Ghost>
      <View api={api} />
    </Stack>
  )
}

export function CollapsibleOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useCollapsible({
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function CollapsibleDisabled() {
  const api = useCollapsible({ disabled: true })
  return <View api={api} label="Release notes (disabled)" />
}

export function CollapsibleHiddenUntilFound() {
  const [open, setOpen] = useState(false)
  const api = useCollapsible({
    hiddenUntilFound: true,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <View api={api}>
        <p>
          The changelog also lists a fix for the flickering tooltip on the
          pricing page.
        </p>
      </View>
      <Log label={`search "flickering" · open`} value={String(open)} />
    </Stack>
  )
}

export function CollapsiblePartial() {
  const api = useCollapsible({ collapsedHeight: "48px" })
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Content} {...api.getContentProps()}>
        <p>
          Zag machines describe how a component behaves, not how it looks. Each
          one is a small state machine with typed props, so the same logic
          drives React, Solid, Svelte, Vue and Preact. You bring the markup and
          the styles, the machine handles focus, keyboard and ARIA.
        </p>
      </div>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        {api.open ? "Show less" : "Show more"}
        <span className={styles.Indicator} {...api.getIndicatorProps()}>
          ▾
        </span>
      </button>
    </div>
  )
}

export function CollapsibleExitComplete() {
  const [count, setCount] = useState(0)
  const api = useCollapsible({
    defaultOpen: true,
    onExitComplete: () => setCount((n) => n + 1),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="onExitComplete" value={`${count} times`} />
    </Stack>
  )
}

export function CollapsibleAnimation() {
  const api = useCollapsible()
  return <View api={api} label="Animated content" />
}
