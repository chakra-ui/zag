import { defineComponent, h, Fragment, computed } from "vue"
import { accordion } from "@ui-machines/web"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"

export default defineComponent({
  setup() {
    const [state, send] = useMachine(accordion.machine)
    const _ref = useMount(send)

    const machineState = computed(() => {
      const machine = accordion.connect(state.value, send, normalizeProps)
      return {
        rootProps: machine.rootProps,
        getAccordionProps: machine.getAccordionProps,
      }
    })

    const accodionPartsProps = computed(() => ({
      home: machineState.value.getAccordionProps({ uid: "home" }),
      about: machineState.value.getAccordionProps({ uid: "about" }),
      contact: machineState.value.getAccordionProps({ uid: "contact" }),
    }))

    return () => {
      return (
        <div style={{ width: "100%" }}>
          <div ref={_ref} {...machineState.value.rootProps} style={{ maxWidth: "40ch" }}>
            <div {...accodionPartsProps.value.home.groupProps}>
              <h3>
                <button {...accodionPartsProps.value.home.triggerProps}>Home</button>
              </h3>
              <div {...accodionPartsProps.value.home.panelProps}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...accodionPartsProps.value.about.groupProps}>
              <h3>
                <button {...accodionPartsProps.value.about.triggerProps}>About</button>
              </h3>
              <div {...accodionPartsProps.value.about.panelProps}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </div>
            </div>

            <div {...accodionPartsProps.value.contact.groupProps}>
              <h3>
                <button {...accodionPartsProps.value.contact.triggerProps}>Contact</button>
              </h3>
              <div {...accodionPartsProps.value.contact.panelProps}>
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
