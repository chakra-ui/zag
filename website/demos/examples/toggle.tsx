import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle"
import { useId, useState } from "react"
import { RxFontBold, RxStar, RxStarFilled } from "react-icons/rx"
import styles from "../../styles/machines/toggle.module.css"
import { Ghost, Log, Row, Stack } from "./shared"

function useToggle(props: Partial<toggle.Props> = {}) {
  const service = useMachine(toggle.machine, { id: useId(), ...props })
  return toggle.connect(service, normalizeProps)
}

function Toggle(props: { api: toggle.Api }) {
  const { api } = props
  return (
    <button className={styles.Root} {...api.getRootProps()} aria-label="Bold">
      <span className={styles.Indicator} {...api.getIndicatorProps()}>
        <RxFontBold />
      </span>
    </button>
  )
}

export function ToggleDefaultPressed() {
  const api = useToggle({ defaultPressed: true })
  return <Toggle api={api} />
}

export function ToggleControlled() {
  const [pressed, setPressed] = useState(false)
  const api = useToggle({ pressed, onPressedChange: setPressed })
  return (
    <Stack>
      <Toggle api={api} />
      <Ghost onClick={() => setPressed((p) => !p)}>Toggle from outside</Ghost>
    </Stack>
  )
}

export function TogglePressedChange() {
  const [pressed, setPressed] = useState(false)
  const api = useToggle({ onPressedChange: setPressed })
  return (
    <Stack>
      <Toggle api={api} />
      <Log label="pressed" value={pressed ? "on" : "off"} />
    </Stack>
  )
}

export function ToggleDisabled() {
  const api = useToggle({ disabled: true })
  return <Toggle api={api} />
}

export function ToggleProgrammatic() {
  const api = useToggle()
  return (
    <Stack>
      <Toggle api={api} />
      <Row>
        <Ghost onClick={() => api.setPressed(true)}>setPressed(true)</Ghost>
        <Ghost onClick={() => api.setPressed(false)}>setPressed(false)</Ghost>
      </Row>
    </Stack>
  )
}

export function ToggleIndicator() {
  const api = useToggle()
  return (
    <button className={styles.Root} {...api.getRootProps()}>
      <span className={styles.Indicator} {...api.getIndicatorProps()}>
        {api.pressed ? <RxStarFilled /> : <RxStar />}
      </span>
      {api.pressed ? "Starred" : "Star"}
    </button>
  )
}
