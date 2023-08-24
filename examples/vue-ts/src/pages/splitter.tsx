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
        size: [{ id: "aside", size: 40, maxSize: 60 }, { id: "content", size: 20 }, { id: "sources" }],
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
            <div {...api.rootProps}>
              <div {...api.getPanelProps({ id: "aside" })}>
                <p>Aside</p>
              </div>
              <div {...api.getResizeTriggerProps({ id: "aside:content" })}>
                <div class="bar" />
              </div>
              <div {...api.getPanelProps({ id: "content" })}>
                <p>Content</p>
              </div>
              <div {...api.getResizeTriggerProps({ id: "content:sources" })}>
                <div class="bar" />
              </div>
              <div {...api.getPanelProps({ id: "sources" })}>
                <p>Sources</p>
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
