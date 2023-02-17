import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [events, setEvents] = useState<string[]>([])

  const [state, send] = useMachine(
    pressable.machine({
      id: useId(),
      onPressStart(e) {
        setEvents((events) => [...events, `press start with ${e.pointerType}`])
      },
      onPressEnd(e) {
        setEvents((events) => [...events, `press end with ${e.pointerType}`])
      },
      onPress(e) {
        setEvents((events) => [...events, `press with ${e.pointerType}`])
      },
      onPressUp(e) {
        setEvents((events) => [...events, `press up with ${e.pointerType}`])
      },
      onLongPress(e) {
        setEvents((events) => [...events, `long press with ${e.pointerType}`])
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
          <ul style={{ maxHeight: "200px", overflow: "auto" }}>
            {events.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
