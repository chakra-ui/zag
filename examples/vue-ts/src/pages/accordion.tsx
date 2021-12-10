import * as Accordion from "@ui-machines/accordion"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "Accordion",
  setup() {
    const controls = useControls({
      collapsible: { type: "boolean", defaultValue: false, label: "Allow Toggle" },
      multiple: { type: "boolean", defaultValue: false, label: "Allow Multiple" },
      activeId: { type: "select", defaultValue: "", options: ["home", "about", "contact"], label: "Active Id" },
    })

    const [state, send] = useMachine(Accordion.machine, {
      context: controls.context.value,
    })

    const accordionRef = computed(() => Accordion.connect<VuePropTypes>(state.value, send, normalizeProps))
    const ref = useMount(send)

    return () => {
      const { getItemProps, getTriggerProps, getContentProps, rootProps } = accordionRef.value
      return (
        <div style={{ width: "100%" }}>
          <controls.ui />
          <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
            <div {...getItemProps({ value: "home" })}>
              <h3>
                <button {...getTriggerProps({ value: "home" })}>Home</button>
              </h3>
              <div {...getContentProps({ value: "home" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...getItemProps({ value: "about" })}>
              <h3>
                <button {...getTriggerProps({ value: "about" })}>About</button>
              </h3>
              <div {...getContentProps({ value: "about" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...getItemProps({ value: "contact" })}>
              <h3>
                <button {...getTriggerProps({ value: "contact" })}>Contact</button>
              </h3>
              <div {...getContentProps({ value: "contact" })}>
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
