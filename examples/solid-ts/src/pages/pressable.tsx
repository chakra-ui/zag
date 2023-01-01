import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    pressable.machine({
      id: createUniqueId(),
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

  const api = createMemo(() => pressable.connect(state, send, normalizeProps))

  let buttonRef: HTMLButtonElement | undefined
  return (
    <>
      <main class="pressable">
        <button ref={buttonRef} {...api().pressableProps}>
          Get element Press
        </button>
        <br />
        <br />
        <button>Just a button</button>
        <br />
        <br />
        <button onClick={() => buttonRef?.click()}>Programmatic click me</button>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
