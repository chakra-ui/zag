import { injectGlobal } from "@emotion/css"
import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { tabsControls, tabsData, tabsStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

import { Toolbar } from "../components/toolbar"

injectGlobal(tabsStyle)

export default defineComponent({
  name: "Tabs",
  setup() {
    const controls = useControls(tabsControls)

    const [state, send] = useMachine(tabs.machine({ id: "tabs", value: "nils" }), {
      context: controls.context,
    })

    const apiRef = computed(() => tabs.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div {...api.rootProps}>
              <div {...api.indicatorProps} />
              <div {...api.triggerGroupProps}>
                {tabsData.map((data) => (
                  <button {...api.getTriggerProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
                    {data.label}
                  </button>
                ))}
              </div>
              <div {...api.contentGroupProps}>
                {tabsData.map((data) => (
                  <div {...api.getContentProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
                    <p>{data.content}</p>
                    {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
