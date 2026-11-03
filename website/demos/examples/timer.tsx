import { normalizeProps, useMachine } from "@zag-js/react"
import * as timer from "@zag-js/timer"
import { useId, useState } from "react"
import styles from "../../styles/machines/timer.module.css"
import { Log, Stack } from "./shared"

function useTimer(props: Partial<timer.Props> = {}) {
  const service = useMachine(timer.machine, { id: useId(), ...props })
  return timer.connect(service, normalizeProps)
}

const parts = ["hours", "minutes", "seconds"] as const

function Display(props: { api: timer.Api }) {
  const { api } = props
  return (
    <div className={styles.Area} {...api.getAreaProps()}>
      {parts.map((type, i) => (
        <span key={type} className={styles.Group}>
          {i > 0 && (
            <span className={styles.Separator} {...api.getSeparatorProps()}>
              :
            </span>
          )}
          <span className={styles.Item} {...api.getItemProps({ type })}>
            {api.formattedTime[type]}
          </span>
        </span>
      ))}
    </div>
  )
}

const actions = ["start", "pause", "resume", "reset", "restart"] as const

function Controls(props: { api: timer.Api }) {
  const { api } = props
  return (
    <div className={styles.Control} {...api.getControlProps()}>
      {actions.map((action) => (
        <button
          key={action}
          className={styles.Button}
          {...api.getActionTriggerProps({ action })}
        >
          {action[0].toUpperCase() + action.slice(1)}
        </button>
      ))}
    </div>
  )
}

function Timer(props: { api: timer.Api; children?: React.ReactNode }) {
  return (
    <Stack>
      <div className={styles.Root} {...props.api.getRootProps()}>
        <Display api={props.api} />
        <Controls api={props.api} />
      </div>
      {props.children}
    </Stack>
  )
}

export function TimerStartValue() {
  const api = useTimer({ startMs: 1000 * 60 * 60 })
  return <Timer api={api} />
}

export function TimerAutoStart() {
  const api = useTimer({ autoStart: true })
  return <Timer api={api} />
}

export function TimerCountdown() {
  const api = useTimer({
    countdown: true,
    startMs: timer.parse({ minutes: 1 }),
  })
  return <Timer api={api} />
}

export function TimerTarget() {
  const api = useTimer({ targetMs: timer.parse({ seconds: 10 }) })
  return (
    <Timer api={api}>
      <Log
        label="progress"
        value={`${Math.round(api.progressPercent * 100)}%`}
      />
    </Timer>
  )
}

export function TimerInterval() {
  const api = useTimer({ interval: 1000 })
  return <Timer api={api} />
}

export function TimerTick() {
  const [value, setValue] = useState("—")
  const api = useTimer({
    onTick: (details) => {
      const { minutes, seconds } = details.formattedTime
      setValue(`${minutes}:${seconds}`)
    },
  })
  return (
    <Timer api={api}>
      <Log label="onTick" value={value} />
    </Timer>
  )
}

export function TimerComplete() {
  const [count, setCount] = useState(0)
  const api = useTimer({
    countdown: true,
    startMs: timer.parse({ seconds: 5 }),
    targetMs: 0,
    onComplete: () => setCount((n) => n + 1),
  })
  return (
    <Timer api={api}>
      <Log label="onComplete" value={`${count} times`} />
    </Timer>
  )
}

export function TimerProgrammatic() {
  const api = useTimer({
    startMs: timer.parse({ minutes: 1 }),
    countdown: true,
  })
  return (
    <Stack>
      <div className={styles.Root} {...api.getRootProps()}>
        <Display api={api} />
        <div className={styles.Control}>
          <button className={styles.Button} onClick={api.start}>
            start()
          </button>
          <button className={styles.Button} onClick={api.pause}>
            pause()
          </button>
          <button className={styles.Button} onClick={api.resume}>
            resume()
          </button>
          <button className={styles.Button} onClick={api.reset}>
            reset()
          </button>
          <button className={styles.Button} onClick={api.restart}>
            restart()
          </button>
        </div>
      </div>
      <Log
        label="state"
        value={api.running ? "running" : api.paused ? "paused" : "idle"}
      />
    </Stack>
  )
}
