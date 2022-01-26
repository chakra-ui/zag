import * as Tooltip from "@ui-machines/tooltip"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, PropType, Fragment } from "vue"

const TooltipComponent = defineComponent({
  name: "Tooltip",
  props: {
    id: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useMachine(Tooltip.machine.withContext({ id: props.id }))
    const tooltipRef = computed(() => Tooltip.connect<VuePropTypes>(state.value, send, normalizeProps))
    const ref = useSetup({ send, id: props.id })

    return () => {
      const { triggerProps, isVisible, contentProps } = tooltipRef.value
      return (
        <>
          <div>
            <button ref={ref} {...triggerProps}>
              Over me
            </button>
            {isVisible && (
              <div data-testid={`${props.id}-tooltip`} {...contentProps} data-tooltip="">
                Tooltip
              </div>
            )}
          </div>
        </>
      )
    }
  },
})

export default defineComponent(() => {
  return () => (
    <>
      <div style={{ display: "flex" }}>
        <TooltipComponent id="tip-1" />
        <div style={{ marginLeft: "20px" }}>
          <TooltipComponent id="tip-2" />
        </div>
      </div>
    </>
  )
})
