import { normalizeProps, useMachine } from "@zag-js/solid"
import * as timer from "@zag-js/timer"
import { createMemo, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/timer.css"

const FOCUS_MS = 25 * 60_000

const toMs = (time: timer.Time) =>
  ((time.days * 24 + time.hours) * 60 + time.minutes) * 60_000 + time.seconds * 1000 + time.milliseconds
const pad = (value: number) => String(value).padStart(2, "0")

export default function Page() {
  const service = useMachine(timer.machine, { id: createUniqueId(), countdown: true, startMs: FOCUS_MS })
  const api = createMemo(() => timer.connect(service, normalizeProps))

  const secondsLeft = () => Math.ceil(toMs(api().time) / 1000)
  const done = () => Math.round((1 - api().progressPercent) * 100)

  return (
    <>
      <main>
        <div class="timer-pomodoro">
          <p class="hint">A 25-minute focus session. Pause for interruptions, restart to begin again.</p>
          <div {...api().getRootProps()}>
            <div {...api().getAreaProps()}>
              <div {...api().getItemProps({ type: "minutes" })}>{pad(Math.floor(secondsLeft() / 60))}</div>
              <div {...api().getSeparatorProps()}>:</div>
              <div {...api().getItemProps({ type: "seconds" })}>{pad(secondsLeft() % 60)}</div>
            </div>
          </div>
          <div
            class="progress"
            role="progressbar"
            aria-label="Focus session"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={done()}
          >
            <div class="progress-bar" style={{ width: `${done()}%` }} />
          </div>
          <div {...api().getControlProps()}>
            <Show when={secondsLeft() > 0}>
              <button {...api().getActionTriggerProps({ action: "start" })}>Start focus</button>
            </Show>
            <button {...api().getActionTriggerProps({ action: "pause" })}>Pause</button>
            <button {...api().getActionTriggerProps({ action: "resume" })}>Resume</button>
            <button {...api().getActionTriggerProps({ action: "restart" })}>Restart</button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
