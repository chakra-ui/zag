import { accordion } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { defineComponent, h, Fragment, computed, watchEffect } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Accordion",
  setup() {
    const controls = useControls({
      collapsible: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
      multiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
      activeId: { type: "select", defaultValue: "", options: ["home", "about", "contact"], label: "Active Id" },
    })

    watchEffect(() => {
      console.log("watchEffect", controls.context.value)
    })

    const [state, send] = useMachine(accordion.machine, {
      context: controls.context.value,
    })

    const connect = computed(() => accordion.connect(state.value, send, normalizeProps))
    const ref = useMount(send)

    return () => {
      const { getItemProps, getTriggerProps, getContentProps, rootProps } = connect.value
      return (
        <div style={{ width: "100%" }}>
          <controls.ui />
          <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
            <div {...getItemProps({ id: "home" })}>
              <h3>
                <button {...getTriggerProps({ id: "home" })}>Home</button>
              </h3>
              <div {...getContentProps({ id: "home" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...getItemProps({ id: "about" })}>
              <h3>
                <button {...getTriggerProps({ id: "about" })}>About</button>
              </h3>
              <div {...getContentProps({ id: "about" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...getItemProps({ id: "contact" })}>
              <h3>
                <button {...getTriggerProps({ id: "contact" })}>Contact</button>
              </h3>
              <div {...getContentProps({ id: "contact" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>
          </div>

          <StateVisualizer state={state.value} />
        </div>
      )
    }
  },
})
