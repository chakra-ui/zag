import { injectGlobal } from "@emotion/css"
import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { tabsControls } from "../../../../shared/controls"
import { tabsData } from "../../../../shared/data"
import { tabsStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"
import { useId } from "../hooks/use-id"
import { Toolbar } from "../components/toolbar"

injectGlobal(tabsStyle)

export default defineComponent({
  name: "Tabs",
  setup() {
    const controls = useControls(tabsControls)

    const [state, send] = useMachine(tabs.machine({ value: "nils" }), {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })
    const apiRef = computed(() => tabs.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div ref={ref} {...api.rootProps}>
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
