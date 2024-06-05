import { normalizeProps, useMachine } from "@zag-js/vue"
import * as timer from "@zag-js/timer"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "TimerCountdown",
  setup() {
    const [state, send] = useMachine(
      timer.machine({
        id: "v1",
        autoStart: true,
      }),
    )

    const apiRef = computed(() => timer.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="timer">
            <div {...api.getRootProps()}>
              <div {...api.getSegmentProps({ type: "days" })}>{api.formattedTime.days}</div>
              <div {...api.getSeparatorProps()}>:</div>
              <div {...api.getSegmentProps({ type: "hours" })}>{api.formattedTime.hours}</div>
              <div {...api.getSeparatorProps()}>:</div>
              <div {...api.getSegmentProps({ type: "minutes" })}>{api.formattedTime.minutes}</div>
              <div {...api.getSeparatorProps()}>:</div>
              <div {...api.getSegmentProps({ type: "seconds" })}>{api.formattedTime.seconds}</div>
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={api.start}>START</button>
              <button onClick={api.pause}>PAUSE</button>
              <button onClick={api.resume}>RESUME</button>
              <button onClick={api.reset}>RESET</button>
            </div>
          </main>

          <Toolbar controls={null} viz>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
