import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { pressableControls, pressableStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const [state] = useMachine(
    pressable.machine({
      getElement: () => buttonRef,
      onPressStart() {
        console.log("press start")
      },
      onPressEnd() {
        console.log("press end")
      },
      onPress(e) {
        console.log("pressed with " + e.originalEvent.pointerType)
      },
      onPressUp() {
        console.log("press up")
      },
      onLongPress() {
        console.log("long press")
      },
    }),
  )

  let buttonRef
  return (
    <>
      <main class="pressable">
        <button ref={buttonRef}>Get element Press</button>
        <br />
        <br />
        <br />
        <button onClick={() => buttonRef?.click()}>Programmatic click me</button>
      </main>
      <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
