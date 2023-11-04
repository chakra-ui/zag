import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls, collapsibleData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "collapsible",
  setup() {
    const controls = useControls(collapsibleControls)

    const [state, send] = useMachine(collapsible.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => collapsible.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="collapsible">
            <div {...api.rootProps}>
              <div>
                <span>{collapsibleData.headline}</span>
                <button {...api.triggerProps}>{api.isOpen ? "Collapse" : "Expand"}</button>
              </div>

              <div>
                <span>{collapsibleData.visibleItem}</span>
              </div>

              <div {...api.contentProps}>
                {collapsibleData.items.map((item) => (
                  <div key={item}>
                    <span>{item}</span>
                  </div>
                ))}
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
