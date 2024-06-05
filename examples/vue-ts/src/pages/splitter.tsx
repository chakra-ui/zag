import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Splitter",
  setup() {
    const controls = useControls(splitterControls)

    const [state, send] = useMachine(
      splitter.machine({
        id: "1",
        size: [
          { id: "a", size: 50 },
          { id: "b", size: 50 },
        ],
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => splitter.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="splitter">
            <div {...api.getRootProps()}>
              <div {...api.getPanelProps({ id: "a" })}>
                <p>A</p>
              </div>
              <div {...api.getResizeTriggerProps({ id: "a:b" })} />
              <div {...api.getPanelProps({ id: "b" })}>
                <p>B</p>
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} omit={["previousPanels", "initialSize"]} />
          </Toolbar>
        </>
      )
    }
  },
})
