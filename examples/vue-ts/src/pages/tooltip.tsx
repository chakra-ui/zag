import { defineComponent, computed, h, Fragment, PropType } from "vue"
import { useMachine, normalizeProps, useSnapshot, VuePropTypes } from "@ui-machines/vue"
import { tooltip } from "@ui-machines/tooltip"
import { useMount } from "../hooks/use-mount"

const Tooltip = defineComponent({
  name: "Tooltip",
  props: {
    id: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useMachine(tooltip.machine.withContext({ id: props.id }))
    const machineState = computed(() => tooltip.connect<VuePropTypes>(state.value, send, normalizeProps))
    const ref = useMount(send)

    return () => (
      <>
        <div>
          <button ref={ref} {...machineState.value.triggerProps}>
            Over me
          </button>
          {machineState.value.isVisible && (
            <div {...machineState.value.tooltipProps} style={{ background: "red", padding: "10px" }}>
              Tooltip
            </div>
          )}
        </div>
      </>
    )
  },
})

export default defineComponent(() => {
  const _state = useSnapshot(tooltip.store)

  return () => (
    <>
      <h3>{JSON.stringify(_state.value, null, 2)}</h3>
      <div style={{ display: "flex" }}>
        <Tooltip id="tip-1" />
        <div style={{ marginLeft: "20px" }}>
          <Tooltip id="tip-2" />
        </div>
      </div>
    </>
  )
})
