import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, ref } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "pressable",
  setup() {
    const buttonRef = ref<HTMLButtonElement | null>(null)
    const [state, send] = useMachine(
      pressable.machine({
        id: "1",
        onPressStart() {
          console.log("press start")
        },
        onPressEnd() {
          console.log("press end")
        },
        onPress(e) {
          console.log("pressed with " + e.pointerType)
        },
        onPressUp() {
          console.log("press up")
        },
        onLongPress() {
          console.log("long press")
        },
      }),
    )

    const apiRef = computed(() => pressable.connect(state.value, send, normalizeProps))
    return () => {
      const button = buttonRef.value
      const api = apiRef.value

      return (
        <>
          <main class="pressable">
            <button ref={buttonRef} {...api.pressableProps}>
              Get element Press
            </button>
            <br />
            <br />
            <button>Just a button</button>
            <br />
            <br />
            <button onClick={() => button?.click()}>Programmatic click me</button>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
