import { injectGlobal } from "@emotion/css"
import * as Tooltip from "@ui-machines/tooltip"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, PropType, Fragment } from "vue"
import { tooltipStyles } from "../../../../shared/style"

injectGlobal(tooltipStyles)

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
    const ref = useSetup<HTMLButtonElement>({ send, id: props.id })
    const apiRef = computed(() => Tooltip.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <div>
            <button ref={ref} {...api.triggerProps}>
              Over me
            </button>
            {api.isOpen && (
              <div {...api.positionerProps}>
                <div data-testid={`${props.id}-tooltip`} {...api.contentProps} class="tooltip">
                  Tooltip
                </div>
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
