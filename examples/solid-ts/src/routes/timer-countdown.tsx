import { normalizeProps, useMachine } from "@zag-js/solid"
import * as timer from "@zag-js/timer"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const service = useMachine(timer.machine, {
    id: createUniqueId(),
    countdown: true,
    autoStart: true,
    startMs: timer.parse({ days: 2, seconds: 10 }),
    onComplete() {
      console.log("Timer completed")
    },
  })

  const api = createMemo(() => timer.connect(service, normalizeProps))

  return (
    <>
      <main class="timer">
        <div {...api().getRootProps()}>
          <div {...api().getAreaProps()}>
            <div {...api().getItemProps({ type: "days" })}>{api().formattedTime.days}</div>
            <div {...api().getSeparatorProps()}>:</div>
            <div {...api().getItemProps({ type: "hours" })}>{api().formattedTime.hours}</div>
            <div {...api().getSeparatorProps()}>:</div>
            <div {...api().getItemProps({ type: "minutes" })}>{api().formattedTime.minutes}</div>
            <div {...api().getSeparatorProps()}>:</div>
            <div {...api().getItemProps({ type: "seconds" })}>{api().formattedTime.seconds}</div>
          </div>
        </div>

        <div {...api().getControlProps()}>
          <button onClick={api().start}>START</button>
          <button onClick={api().pause}>PAUSE</button>
          <button onClick={api().resume}>RESUME</button>
          <button onClick={api().reset}>RESET</button>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
