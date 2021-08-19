import { defineComponent } from "@vue/runtime-core"
import { computed, h, Fragment, PropType, ref, watch } from "vue"
import { useMachine, normalizeProps } from "@ui-machines/vue"
import { tooltip } from "@ui-machines/web"
import { useMount } from "../hooks/use-mount"
import { StateVisualizer } from "../components/state-visualizer"

const Tooltip = defineComponent({
  name: "Tooltip",
  props: {
    id: {
      type: String as PropType<string>,
      required: true,
    },
  },
  emits: ["updateState"],
  setup(props, { emit }) {
    const [state, send] = useMachine(tooltip.machine.withContext({ id: props.id }))

    const _ref = useMount(send)
    const mp = computed(() => tooltip.connect(state.value, send, normalizeProps))

    watch(state, (newState) => emit("updateState", newState), {
      immediate: true,
    })

    return () => (
      <>
        <div className="App">
          <button ref={_ref} {...mp.value.triggerProps}>
            Over me
          </button>
          {mp.value.isVisible && (
            <div {...mp.value.tooltipProps} style={{ background: "red", padding: "10px" }}>
              Tooltip
            </div>
          )}
        </div>
      </>
    )
  },
})

export default defineComponent(() => {
  const snap = ref()
  const handleUpdateStore = (s: { id: string | null }) => {
    snap.value = s
  }

  return () => (
    <>
      <h3>{JSON.stringify({ id: snap.value?.context?.id || null })}</h3>
      <div style={{ display: "flex" }}>
        {/* @ts-expect-error */}
        <Tooltip onUpdateState={handleUpdateStore} id="tip-1" />
        <div style={{ marginLeft: "80px" }}>
          {/* @ts-expect-error */}
          <Tooltip onUpdateState={handleUpdateStore} id="tip-2" />
        </div>
      </div>

      <StateVisualizer state={snap.value} />
    </>
  )
})
