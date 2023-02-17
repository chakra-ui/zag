import * as pressable from "@zag-js/pressable"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [events, setEvents] = createSignal<string[]>([])

  const [state, send] = useMachine(
    pressable.machine({
      id: createUniqueId(),
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

  const api = createMemo(() => pressable.connect(state, send, normalizeProps))
  let buttonRef: HTMLButtonElement | undefined

  return (
    <>
      <main class="pressable">
        <div style={{ display: "flex", "flex-direction": "column", gap: "20px", "align-items": "flex-start" }}>
          <button ref={buttonRef} {...api().pressableProps}>
            Get element Press
          </button>
          <button onClick={() => buttonRef?.click()}>Programmatic click me</button>
          <ul style={{ "max-height": "200px", overflow: "auto" }}>
            <For each={events()}>{(e) => <li>{e}</li>}</For>
          </ul>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
