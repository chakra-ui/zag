import { accordion } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { defineComponent, h, Fragment, computed } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "Accordion",
  setup() {
    const [state, send] = useMachine(accordion.machine)
    const connect = computed(() => accordion.connect(state.value, send, normalizeProps))
    const ref = useMount(send)

    return () => {
      const { getItemProps, getTriggerProps, getPanelProps, rootProps } = connect.value
      return (
        <div style={{ width: "100%" }}>
          <div ref={ref} {...rootProps} style={{ maxWidth: "40ch" }}>
            <div {...getItemProps({ id: "home" })}>
              <h3>
                <button {...getTriggerProps({ id: "home" })}>Home</button>
              </h3>
              <div {...getPanelProps({ id: "home" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...getItemProps({ id: "about" })}>
              <h3>
                <button {...getTriggerProps({ id: "about" })}>About</button>
              </h3>
              <div {...getPanelProps({ id: "about" })}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...getItemProps({ id: "contact" })}>
              <h3>
                <button {...getTriggerProps({ id: "contact" })}>Contact</button>
              </h3>
              <div {...getPanelProps({ id: "contact" })}>
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
