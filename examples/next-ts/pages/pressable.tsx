import * as pressable from "@zag-js/pressable"
import { useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state] = useMachine(
    pressable.machine({
      getElement: () => buttonRef.current,
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

  const buttonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <>
      <main className="pressable">
        <button ref={buttonRef}>Get element Press</button>
        <br />
        <br />
        <button>Just a button</button>
        <br />
        <br />
        <button onClick={() => buttonRef.current?.click()}>Programmatic click me</button>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
