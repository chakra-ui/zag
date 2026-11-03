import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { useId, useState } from "react"
import styles from "../../styles/machines/tabs.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const data = [
  {
    value: "account",
    label: "Account",
    content: "Update your name, email and profile photo.",
  },
  {
    value: "billing",
    label: "Billing",
    content: "Manage your plan, invoices and payment method.",
  },
  {
    value: "team",
    label: "Team",
    content: "Invite people and choose what they can access.",
  },
]

function useTabs(props: Partial<tabs.Props> = {}) {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "account",
    ...props,
  })
  return tabs.connect(service, normalizeProps)
}

interface ViewProps {
  api: tabs.Api
  disabled?: string
  indicator?: boolean
}

function View(props: ViewProps) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.List} {...api.getListProps()}>
        {data.map((item) => (
          <button
            key={item.value}
            className={styles.Trigger}
            {...api.getTriggerProps({
              value: item.value,
              disabled: props.disabled === item.value,
            })}
          >
            {item.label}
          </button>
        ))}
        {props.indicator && (
          <div className={styles.Indicator} {...api.getIndicatorProps()} />
        )}
      </div>
      {data.map((item) => (
        <div
          key={item.value}
          className={styles.Content}
          {...api.getContentProps({ value: item.value })}
        >
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  )
}

export function TabsInitialValue() {
  const api = useTabs({ defaultValue: "billing" })
  return (
    <Stack>
      <View api={api} />
      <Ghost onClick={() => api.setValue("team")}>api.setValue("team")</Ghost>
    </Stack>
  )
}

export function TabsControlled() {
  const [value, setValue] = useState<string | null>("account")
  const api = useTabs({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Row>
        {data.map((item) => (
          <Ghost key={item.value} onClick={() => setValue(item.value)}>
            {item.label}
          </Ghost>
        ))}
      </Row>
      <View api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function TabsVertical() {
  const api = useTabs({ orientation: "vertical" })
  return <View api={api} indicator />
}

export function TabsIndicator() {
  const api = useTabs()
  return <View api={api} indicator />
}

export function TabsDisabled() {
  const api = useTabs()
  return <View api={api} disabled="billing" />
}

export function TabsEvents() {
  const [value, setValue] = useState<string | null>("account")
  const [focused, setFocused] = useState<string | null>(null)
  const api = useTabs({
    onValueChange: (details) => setValue(details.value),
    onFocusChange: (details) => setFocused(details.focusedValue),
  })
  return (
    <Stack>
      <View api={api} />
      <Row>
        <Log label="onValueChange" value={show(value)} />
        <Log label="onFocusChange" value={show(focused)} />
      </Row>
    </Stack>
  )
}

export function TabsDeselectable() {
  const [value, setValue] = useState<string | null>("account")
  const api = useTabs({
    deselectable: true,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function TabsManual() {
  const api = useTabs({ activationMode: "manual" })
  return <View api={api} indicator />
}

export function TabsNoLoop() {
  const api = useTabs({ loopFocus: false })
  return <View api={api} indicator />
}

export function TabsRtl() {
  const api = useTabs({ dir: "rtl" })
  return (
    <div dir="rtl">
      <View api={api} indicator />
    </div>
  )
}

export function TabsProgrammatic() {
  const api = useTabs()
  return (
    <Stack>
      <View api={api} indicator />
      <Row>
        <Ghost onClick={() => api.selectPrevious()}>selectPrevious()</Ghost>
        <Ghost onClick={() => api.selectNext()}>selectNext()</Ghost>
        <Ghost onClick={() => api.focus()}>focus()</Ghost>
      </Row>
    </Stack>
  )
}
