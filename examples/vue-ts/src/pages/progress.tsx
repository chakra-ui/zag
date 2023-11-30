import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { progressControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "progress",
  setup() {
    const controls = useControls(progressControls)

    const [state, send] = useMachine(progress.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => progress.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="progress">
            <div {...api.rootProps}>
              <div {...api.labelProps}>Upload progress</div>
              <svg {...api.circleProps}>
                <circle {...api.circleTrackProps} />
                <circle {...api.circleRangeProps} />
              </svg>
              <div {...api.trackProps}>
                <div {...api.rangeProps} />
              </div>
              <div {...api.valueTextProps}>{api.valueAsString}</div>
              <div>
                <button onClick={() => api.setValue((api.value ?? 0) - 20)}>Decrease</button>
                <button onClick={() => api.setValue((api.value ?? 0) + 20)}>Increase</button>
                <button onClick={() => api.setValue(null)}>Indeterminate</button>
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
