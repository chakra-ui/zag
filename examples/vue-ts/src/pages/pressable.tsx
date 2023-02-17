import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, ref } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "pressable",
  setup() {
    const eventsRef = ref<string[]>([])

    const [state, send] = useMachine(
      pressable.machine({
        id: "1",
        onPressStart(e) {
          eventsRef.value.push(`press start with ${e.pointerType}`)
        },
        onPressEnd(e) {
          eventsRef.value.push(`press end with ${e.pointerType}`)
        },
        onPress(e) {
          eventsRef.value.push(`press with ${e.pointerType}`)
        },
        onPressUp(e) {
          eventsRef.value.push(`press up with ${e.pointerType}`)
        },
        onLongPress(e) {
          eventsRef.value.push(`long press with ${e.pointerType}`)
        },
      }),
    )

    const apiRef = computed(() => pressable.connect(state.value, send, normalizeProps))
    const buttonRef = ref<HTMLButtonElement | null>(null)

    return () => {
      const button = buttonRef.value
      const api = apiRef.value

      return (
        <>
          <main class="pressable">
            <div style={{ display: "flex", "flex-direction": "column", gap: "20px", "align-items": "flex-start" }}>
              <button ref={buttonRef} {...api.pressableProps}>
                Get element Press
              </button>
              <button onClick={() => button?.click()}>Programmatic click me</button>
            </div>
            <ul style={{ "max-height": "200px", overflow: "auto" }}>
              {eventsRef.value.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
