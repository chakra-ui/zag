import { accordion } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"

import { defineComponent, h, Fragment, computed } from "vue"

import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  name: "Accordion",
  setup() {
    const [state, send] = useMachine(accordion.machine)

    const ref = useMount(send)

    const machineState = computed(() => {
      const machine = accordion.connect(state.value, send, normalizeProps)
      return {
        rootProps: machine.rootProps,
        getAccordionItem: machine.getAccordionItem,
      }
    })

    const parts = computed(() => ({
      home: machineState.value.getAccordionItem({ id: "home" }),
      about: machineState.value.getAccordionItem({ id: "about" }),
      contact: machineState.value.getAccordionItem({ id: "contact" }),
    }))

    return () => {
      return (
        <div style={{ width: "100%" }}>
          <div ref={ref} {...machineState.value.rootProps} style={{ maxWidth: "40ch" }}>
            <div {...parts.value.home.groupProps}>
              <h3>
                <button {...parts.value.home.triggerProps}>Home</button>
              </h3>
              <div {...parts.value.home.panelProps}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...parts.value.about.groupProps}>
              <h3>
                <button {...parts.value.about.triggerProps}>About</button>
              </h3>
              <div {...parts.value.about.panelProps}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...parts.value.contact.groupProps}>
              <h3>
                <button {...parts.value.contact.triggerProps}>Contact</button>
              </h3>
              <div {...parts.value.contact.panelProps}>
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
