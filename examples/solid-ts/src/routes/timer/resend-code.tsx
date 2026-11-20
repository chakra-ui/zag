import { normalizeProps, useMachine } from "@zag-js/solid"
import * as timer from "@zag-js/timer"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/timer.css"

const toMs = (time: timer.Time) =>
  ((time.days * 24 + time.hours) * 60 + time.minutes) * 60_000 + time.seconds * 1000 + time.milliseconds

export default function Page() {
  const [canResend, setCanResend] = createSignal(false)
  const [sent, setSent] = createSignal(1)

  const service = useMachine(timer.machine, {
    id: createUniqueId(),
    countdown: true,
    autoStart: true,
    startMs: 30_000,
    onComplete: () => setCanResend(true),
  })
  const api = createMemo(() => timer.connect(service, normalizeProps))
  const secondsLeft = () => Math.ceil(toMs(api().time) / 1000)

  return (
    <>
      <main>
        <div class="timer-resend-code">
          <div {...api().getRootProps()}>
            <span class="code" aria-hidden="true">
              ••• •••
            </span>
          </div>
          <button
            type="button"
            disabled={!canResend()}
            onClick={() => {
              setCanResend(false)
              setSent((count) => count + 1)
              api().restart()
            }}
          >
            {canResend() ? "Resend code" : `Resend code in ${secondsLeft()}s`}
          </button>
          <p class="sent">
            Sent {sent()} {sent() === 1 ? "code" : "codes"}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
