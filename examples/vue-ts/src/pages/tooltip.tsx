import * as Tooltip from "@ui-machines/tooltip"
import { normalizeProps, useMachine, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, PropType, Fragment } from "vue"
import { useMount } from "../hooks/use-mount"

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
    const ref = useMount(send)

    return () => {
      const { triggerProps, isVisible, contentProps } = tooltipRef.value
      return (
        <>
          <div>
            <button ref={ref} {...triggerProps}>
              Over me
            </button>
            {isVisible && (
              <div {...contentProps} style={{ background: "red", padding: "10px" }}>
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
