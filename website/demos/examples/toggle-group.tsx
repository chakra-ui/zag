import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { useId, useState } from "react"
import { RxFontBold, RxFontItalic, RxUnderline } from "react-icons/rx"
import styles from "../../styles/machines/toggle-group.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const items = [
  { value: "bold", label: "Bold", icon: RxFontBold },
  { value: "italic", label: "Italic", icon: RxFontItalic },
  { value: "underline", label: "Underline", icon: RxUnderline },
]

function useToggleGroup(props: Partial<toggle.Props> = {}) {
  const service = useMachine(toggle.machine, { id: useId(), ...props })
  return toggle.connect(service, normalizeProps)
}

function ToggleGroup(props: { api: toggle.Api; disabledItem?: string }) {
  const { api } = props
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      {items.map((item) => (
        <button
          key={item.value}
          className={styles.Item}
          aria-label={item.label}
          {...api.getItemProps({
            value: item.value,
            disabled: item.value === props.disabledItem,
          })}
        >
          <item.icon />
        </button>
      ))}
    </div>
  )
}

export function ToggleGroupVertical() {
  const api = useToggleGroup({ orientation: "vertical" })
  return <ToggleGroup api={api} />
}

export function ToggleGroupValueChange() {
  const [value, setValue] = useState<string[]>([])
  const api = useToggleGroup({
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function ToggleGroupControlled() {
  const [value, setValue] = useState<string[]>(["italic"])
  const api = useToggleGroup({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Ghost onClick={() => setValue(["bold"])}>Pick bold from outside</Ghost>
    </Stack>
  )
}

export function ToggleGroupMultiple() {
  const [value, setValue] = useState<string[]>(["bold"])
  const api = useToggleGroup({
    multiple: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Log label="value" value={show(value)} />
    </Stack>
  )
}

export function ToggleGroupDisabled() {
  const api = useToggleGroup({ disabled: true, defaultValue: ["bold"] })
  return <ToggleGroup api={api} />
}

export function ToggleGroupDisabledItem() {
  const api = useToggleGroup()
  return <ToggleGroup api={api} disabledItem="bold" />
}

export function ToggleGroupNoLoop() {
  const api = useToggleGroup({ loopFocus: false })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Log label="try" value="Tab in, then arrow keys" />
    </Stack>
  )
}

export function ToggleGroupNoRovingFocus() {
  const api = useToggleGroup({ rovingFocus: false })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Log label="try" value="Tab through each item" />
    </Stack>
  )
}

export function ToggleGroupDeselectable() {
  const api = useToggleGroup({ deselectable: false, defaultValue: ["bold"] })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Log label="try" value="Click the pressed item" />
    </Stack>
  )
}

export function ToggleGroupProgrammatic() {
  const api = useToggleGroup({ multiple: true })
  return (
    <Stack>
      <ToggleGroup api={api} />
      <Row>
        <Ghost onClick={() => api.setValue(["bold", "italic"])}>
          setValue(["bold", "italic"])
        </Ghost>
        <Ghost onClick={() => api.setValue([])}>Clear</Ghost>
      </Row>
    </Stack>
  )
}
