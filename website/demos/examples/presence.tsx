import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"
import styles from "../../styles/machines/presence.module.css"
import { Button, Log, Stack } from "./shared"

function Presence(props: {
  present: boolean
  onExitComplete?: () => void
  onEnterComplete?: () => void
}) {
  const service = useMachine(presence.machine, {
    present: props.present,
    onExitComplete: props.onExitComplete,
    onEnterComplete: props.onEnterComplete,
  })
  const api = presence.connect(service, normalizeProps)
  if (!api.present) return null
  return (
    <div
      className={styles.Content}
      data-state={api.skip ? undefined : props.present ? "open" : "closed"}
      ref={api.setNode}
    >
      Content
    </div>
  )
}

export function PresenceExitComplete() {
  const [open, setOpen] = useState(true)
  const [exits, setExits] = useState(0)
  return (
    <Stack>
      <Button onClick={() => setOpen((value) => !value)}>
        {open ? "Hide" : "Show"}
      </Button>
      <div className={styles.Slot}>
        <Presence
          present={open}
          onExitComplete={() => setExits((n) => n + 1)}
        />
      </div>
      <Log label="onExitComplete" value={`${exits} times`} />
    </Stack>
  )
}

export function PresenceEnterComplete() {
  const [open, setOpen] = useState(false)
  const [enters, setEnters] = useState(0)
  return (
    <Stack>
      <Button onClick={() => setOpen((value) => !value)}>
        {open ? "Hide" : "Show"}
      </Button>
      <div className={styles.Slot}>
        <Presence
          present={open}
          onEnterComplete={() => setEnters((n) => n + 1)}
        />
      </div>
      <Log label="onEnterComplete" value={`${enters} times`} />
    </Stack>
  )
}

export const presenceExamples = {
  PresenceExitComplete,
  PresenceEnterComplete,
}
