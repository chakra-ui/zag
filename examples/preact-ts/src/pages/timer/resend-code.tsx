import { normalizeProps, useMachine } from "@zag-js/preact"
import * as timer from "@zag-js/timer"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/timer.css"

const toMs = (time: timer.Time) =>
  ((time.days * 24 + time.hours) * 60 + time.minutes) * 60_000 + time.seconds * 1000 + time.milliseconds

export default function Page() {
  const [canResend, setCanResend] = useState(false)
  const [sent, setSent] = useState(1)

  const service = useMachine(timer.machine, {
    id: useId(),
    countdown: true,
    autoStart: true,
    startMs: 30_000,
    onComplete: () => setCanResend(true),
  })
  const api = timer.connect(service, normalizeProps)
  const secondsLeft = Math.ceil(toMs(api.time) / 1000)

  return (
    <>
      <main>
        <div className="timer-resend-code">
          <p className="hint">We sent a 6-digit code to ada@example.com. You can ask for a new one in 30 seconds.</p>
          <div {...api.getRootProps()}>
            <span className="code" aria-hidden="true">
              ••• •••
            </span>
          </div>
          <button
            type="button"
            disabled={!canResend}
            onClick={() => {
              setCanResend(false)
              setSent((count) => count + 1)
              api.restart()
            }}
          >
            {canResend ? "Resend code" : `Resend code in ${secondsLeft}s`}
          </button>
          <p className="sent" data-testid="sent-count">
            Sent {sent} {sent === 1 ? "code" : "codes"}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
