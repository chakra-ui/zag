import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(
    pressable.machine({
      id: useId(),
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

  const api = pressable.connect(state, send, normalizeProps)

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <main className="pressable">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "flex-start" }}>
          <button ref={buttonRef} {...api.pressableProps}>
            Get element Press
          </button>
          <button onClick={() => buttonRef.current?.click()}>Programmatic click me</button>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
