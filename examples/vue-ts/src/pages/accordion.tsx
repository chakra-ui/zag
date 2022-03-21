import { injectGlobal } from "@emotion/css"
import * as Accordion from "@ui-machines/accordion"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { accordionControls } from "../../../../shared/controls"
import { accordionData } from "../../../../shared/data"
import { accordionStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(accordionStyle)

export default defineComponent({
  name: "Accordion",
  setup() {
    const controls = useControls(accordionControls)

    const [state, send] = useMachine(Accordion.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const accordion = computed(() => Accordion.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const { getItemProps, getTriggerProps, getContentProps, rootProps } = accordion.value

      return (
        <>
          <controls.ui />

          <div class="accordion" ref={ref} {...rootProps}>
            {accordionData.map((item) => (
              <div class="accordion__item" {...getItemProps({ value: item.id })}>
                <h3>
                  <button
                    class="accordion__trigger"
                    data-testid={`${item.id}:trigger`}
                    {...getTriggerProps({ value: item.id })}
                  >
                    {item.label}
                  </button>
                </h3>
                <div
                  class="accordion__content"
                  data-testid={`${item.id}:content`}
                  {...getContentProps({ value: item.id })}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </div>
              </div>
            ))}
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
