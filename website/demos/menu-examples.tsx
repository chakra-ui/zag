import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import styles from "../styles/machines/menu.module.css"

const items = [
  { label: "Edit", value: "edit" },
  { label: "Duplicate", value: "duplicate" },
  { label: "Export", value: "export" },
  { label: "Delete", value: "delete" },
]

function useMenu(props: Partial<menu.Props> = {}) {
  const service = useMachine(menu.machine, { id: useId(), ...props })
  return menu.connect(service, normalizeProps)
}

function Trigger(props: { api: menu.Api; label?: string }) {
  return (
    <button className={styles.Trigger} {...props.api.getTriggerProps()}>
      {props.label ?? "Actions"}
      <span className={styles.Indicator} {...props.api.getIndicatorProps()}>
        ▾
      </span>
    </button>
  )
}

function Content(props: { api: menu.Api; children?: React.ReactNode }) {
  const { api } = props
  return (
    <Portal>
      <div {...api.getPositionerProps()}>
        <div className={styles.Content} {...api.getContentProps()}>
          {props.children ??
            items.map((item) => (
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
  )
}

function Log(props: { label: string; value: string }) {
  return (
    <output className={styles.Log}>
      {props.label} <strong>{props.value}</strong>
    </output>
  )
}

function Stack(props: { children: React.ReactNode }) {
  return <div className={styles.Example}>{props.children}</div>
}

export function MenuSelection() {
  const [value, setValue] = useState("—")
  const api = useMenu({ onSelect: (details) => setValue(details.value) })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="onSelect" value={value} />
    </Stack>
  )
}

export function MenuOpenChange() {
  const [open, setOpen] = useState(false)
  const api = useMenu({ onOpenChange: (details) => setOpen(details.open) })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="open" value={String(open)} />
    </Stack>
  )
}

export function MenuControlled() {
  const [open, setOpen] = useState(false)
  const api = useMenu({
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
  return (
    <Stack>
      <div className={styles.Row}>
        <Trigger api={api} />
        <button
          type="button"
          className={styles.Ghost}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Close" : "Open"} from outside
        </button>
      </div>
      <Content api={api} />
    </Stack>
  )
}

export function MenuHighlight() {
  const [value, setValue] = useState("—")
  const api = useMenu({
    onHighlightChange: (details) => setValue(details.highlightedValue ?? "—"),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="highlighted" value={value} />
    </Stack>
  )
}

export function MenuInitialHighlight() {
  const api = useMenu({ defaultHighlightedValue: "export" })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
    </Stack>
  )
}

export function MenuGroups() {
  const api = useMenu()
  return (
    <Stack>
      <Trigger api={api} label="Account" />
      <Content api={api}>
        <div
          {...api.getItemProps({ value: "profile" })}
          className={styles.Item}
        >
          Profile
        </div>
        <div
          {...api.getItemProps({ value: "settings" })}
          className={styles.Item}
        >
          Settings
        </div>
        <hr className={styles.Separator} {...api.getSeparatorProps()} />
        <p
          className={styles.GroupLabel}
          {...api.getItemGroupLabelProps({ htmlFor: "accounts" })}
        >
          Switch account
        </p>
        <div {...api.getItemGroupProps({ id: "accounts" })}>
          <div
            {...api.getItemProps({ value: "personal" })}
            className={styles.Item}
          >
            Personal
          </div>
          <div {...api.getItemProps({ value: "work" })} className={styles.Item}>
            Work
          </div>
        </div>
      </Content>
    </Stack>
  )
}

const orders = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
]

const columns = [
  { label: "Name", value: "name" },
  { label: "Owner", value: "owner" },
  { label: "Updated", value: "updated" },
]

export function MenuOptions() {
  const [order, setOrder] = useState("newest")
  const [shown, setShown] = useState(["name", "updated"])
  const api = useMenu({ closeOnSelect: false })
  return (
    <Stack>
      <Trigger api={api} label="View" />
      <Content api={api}>
        <p className={styles.GroupLabel}>Sort</p>
        {orders.map((item) => {
          const option = {
            type: "radio" as const,
            name: "order",
            value: item.value,
            checked: order === item.value,
            onCheckedChange: () => setOrder(item.value),
          }
          return (
            <div
              key={item.value}
              className={styles.Item}
              {...api.getOptionItemProps(option)}
            >
              <span
                className={styles.Check}
                {...api.getItemIndicatorProps(option)}
              >
                ●
              </span>
              <span {...api.getItemTextProps(option)}>{item.label}</span>
            </div>
          )
        })}
        <hr className={styles.Separator} {...api.getSeparatorProps()} />
        <p className={styles.GroupLabel}>Columns</p>
        {columns.map((item) => {
          const option = {
            type: "checkbox" as const,
            name: "columns",
            value: item.value,
            checked: shown.includes(item.value),
            onCheckedChange: (checked: boolean) =>
              setShown((prev) =>
                checked
                  ? [...prev, item.value]
                  : prev.filter((v) => v !== item.value),
              ),
          }
          return (
            <div
              key={item.value}
              className={styles.Item}
              {...api.getOptionItemProps(option)}
            >
              <span
                className={styles.Check}
                {...api.getItemIndicatorProps(option)}
              >
                ✓
              </span>
              <span {...api.getItemTextProps(option)}>{item.label}</span>
            </div>
          )
        })}
      </Content>
    </Stack>
  )
}

export function MenuKeepOpen() {
  const [count, setCount] = useState(0)
  const api = useMenu({
    closeOnSelect: false,
    onSelect: () => setCount((n) => n + 1),
  })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
      <Log label="selected" value={`${count} times`} />
    </Stack>
  )
}

export function MenuPositioning() {
  const api = useMenu({ positioning: { placement: "right-start" } })
  return (
    <Stack>
      <Trigger api={api} />
      <Content api={api} />
    </Stack>
  )
}

export const menuExamples = {
  MenuSelection,
  MenuOpenChange,
  MenuControlled,
  MenuHighlight,
  MenuInitialHighlight,
  MenuGroups,
  MenuOptions,
  MenuKeepOpen,
  MenuPositioning,
}
