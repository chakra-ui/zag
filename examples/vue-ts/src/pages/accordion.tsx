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
      const { getItemProps, getTriggerProps, getContentProps, rootProps } = connect.value
      return (
        <div style={{ width: "100%" }}>
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
