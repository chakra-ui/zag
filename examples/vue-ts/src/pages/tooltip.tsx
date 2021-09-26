import { defineComponent, computed, h, Fragment, PropType } from "vue"
import { useMachine, normalizeProps, useSnapshot } from "@ui-machines/vue"
import { tooltip } from "@ui-machines/web"
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

    const ref = useMount(send)

    const machineState = computed(() => tooltip.connect(state.value, send, normalizeProps))

    const _state = useSnapshot(tooltip.store)

    const isVisible = computed(() => machineState.value.getIsVisible(_state.value.id))

    return () => (
      <>
        <div>
          <button ref={ref} {...machineState.value.triggerProps}>
            Over me
          </button>
          {isVisible.value && (
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
      <h3>{JSON.stringify({ id: _state.value.id })}</h3>
      <div style={{ display: "flex" }}>
        {/* @ts-expect-error */}
        <Tooltip id="tip-1" />
        <div style={{ marginLeft: "80px" }}>
          {/* @ts-expect-error */}
          <Tooltip id="tip-2" />
        </div>
      </div>
    </>
  )
})
