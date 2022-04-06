import { injectGlobal } from "@emotion/css"
import * as Tabs from "@zag-js/tabs"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { tabsControls } from "../../../../shared/controls"
import { tabsData } from "../../../../shared/data"
import { tabsStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(tabsStyle)

export default defineComponent({
  name: "Tabs",
  setup() {
    const controls = useControls(tabsControls)

    const [state, send] = useMachine(Tabs.machine.withContext({ value: "nils" }), {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })
    const apiRef = computed(() => Tabs.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <controls.ui />

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

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
