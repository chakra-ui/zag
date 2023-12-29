import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "SegmentControl",
  setup() {
    const controls = useControls(radioControls)

    const [state, send] = useMachine(radio.machine({ id: "1", name: "fruit", orientation: "horizontal" }), {
      context: controls.context,
    })

    const apiRef = computed(() => radio.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="segmented-control">
            <div {...api.rootProps}>
              <div {...api.indicatorProps} />
              {radioData.map((opt) => (
                <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                  <span data-testid={`label-${opt.id}`} {...api.getItemTextProps({ value: opt.id })}>
                    {opt.label}
                  </span>
                  <input data-testid={`input-${opt.id}`} {...api.getItemHiddenInputProps({ value: opt.id })} />
                </label>
              ))}
            </div>

            <button onClick={api.clearValue}>reset</button>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
