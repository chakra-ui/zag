import { tabsControls, tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Tabs",
  setup() {
    const controls = useControls(tabsControls)

    const [state, send] = useMachine(tabs.machine({ id: "1", value: "nils" }), {
      context: controls.context,
    })

    const apiRef = computed(() => tabs.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="tabs">
            <div {...api.rootProps}>
              <div {...api.indicatorProps} />
              <div {...api.tablistProps}>
                {tabsData.map((data) => (
                  <button {...api.getTriggerProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
                    {data.label}
                  </button>
                ))}
              </div>
              {tabsData.map((data) => (
                <div {...api.getContentProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
                  <p>{data.content}</p>
                  {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
                </div>
              ))}
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
