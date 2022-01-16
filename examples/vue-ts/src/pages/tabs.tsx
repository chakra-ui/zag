import * as Tabs from "@ui-machines/tabs"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment } from "vue"
import { tabsData } from "../../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "Tabs",
  setup() {
    const controls = useControls({
      activationMode: { type: "select", options: ["manual", "automatic"] as const, defaultValue: "automatic" },
      loop: { type: "boolean", defaultValue: true, label: "loop?" },
    })

    const [state, send] = useMachine(Tabs.machine.withContext({ value: "nils" }), {
      context: controls.context,
    })

    const ref = useMount(send)
    const tabsRef = computed(() => Tabs.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { tabIndicatorProps, tablistProps, getTabProps, getTabPanelProps } = tabsRef.value
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

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
