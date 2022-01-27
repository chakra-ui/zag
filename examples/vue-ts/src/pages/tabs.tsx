import { injectGlobal } from "@emotion/css"
import * as Tabs from "@ui-machines/tabs"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
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
    const tabs = computed(() => Tabs.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { tabIndicatorProps, tablistProps, getTabProps, getTabPanelProps } = tabs.value
      return (
        <div style={{ width: "100%" }}>
          <controls.ui />
          <div class="tabs">
            <div class="tabs__indicator" {...tabIndicatorProps} />
            <div ref={ref} {...tablistProps}>
              {tabsData.map((data) => (
                <button {...getTabProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
                  {data.label}
                </button>
              ))}
            </div>
            {tabsData.map((data) => (
              <div {...getTabPanelProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
                <p>{data.content}</p>
              </div>
            ))}
          </div>

          <StateVisualizer state={state} />
        </div>
      )
    }
  },
})
