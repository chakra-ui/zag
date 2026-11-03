import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import area from "../../styles/machines/context-menu.module.css"
import styles from "../../styles/machines/menu.module.css"
import { Ghost, Log, Stack } from "./shared"

const items = [
  { label: "Cut", value: "cut" },
  { label: "Copy", value: "copy" },
  { label: "Paste", value: "paste" },
  { label: "Delete", value: "delete" },
]

function useContextMenu(props: Partial<menu.Props> = {}) {
  const service = useMachine(menu.machine, { id: useId(), ...props })
  return menu.connect(service, normalizeProps)
}

function ContextMenu(props: { api: menu.Api }) {
  const { api } = props
  return (
    <>
      <div className={area.Area} {...api.getContextTriggerProps()}>
        Right-click here
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            {items.map((item) => (
              <div
                key={item.value}
                className={styles.Item}
                {...api.getItemProps({ value: item.value })}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </Portal>
    </>
  )
}

export function ContextMenuControlled() {
  const [open, setOpen] = useState(false)
  const api = useContextMenu({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <ContextMenu api={api} />
      <Ghost onClick={() => setOpen(false)} disabled={!open}>
        Close from outside
      </Ghost>
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function ContextMenuHighlight() {
  const [value, setValue] = useState("—")
  const api = useContextMenu({
    onHighlightChange: (details) => setValue(details.highlightedValue ?? "—"),
  })
  return (
    <Stack>
      <ContextMenu api={api} />
      <Log label="highlighted" value={value} />
    </Stack>
  )
}

export function ContextMenuSelection() {
  const [value, setValue] = useState("—")
  const api = useContextMenu({
    onSelect: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <ContextMenu api={api} />
      <Log label="onSelect" value={value} />
    </Stack>
  )
}

export function ContextMenuPositioning() {
  const api = useContextMenu({ positioning: { placement: "right-start" } })
  return (
    <Stack>
      <ContextMenu api={api} />
    </Stack>
  )
}

export function ContextMenuKeepOpen() {
  const [count, setCount] = useState(0)
  const api = useContextMenu({
    closeOnSelect: false,
    onSelect: () => setCount((n) => n + 1),
  })
  return (
    <Stack>
      <ContextMenu api={api} />
      <Log label="selected" value={`${count} times`} />
    </Stack>
  )
}
