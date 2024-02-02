import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { clipboardControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "clipboard",
  setup() {
    const controls = useControls(clipboardControls)

    const [state, send] = useMachine(clipboard.machine({ id: "1", value: "Text to Copy!" }), {
      context: controls.context,
    })

    const apiRef = computed(() => clipboard.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="clipboard">
            <div>
              <button {...api.triggerProps}>Copy Text</button>
              <div {...api.getIndicatorProps({ copied: true })}>Copied</div>
              <div {...api.getIndicatorProps({ copied: false })}>Copy</div>
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
