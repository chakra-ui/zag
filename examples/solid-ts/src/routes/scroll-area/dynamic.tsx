import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/scroll-area.css"

export default function Page() {
  const [count, setCount] = createSignal(3)
  const service = useMachine(scrollArea.machine, { id: createUniqueId() })
  const api = createMemo(() => scrollArea.connect(service, normalizeProps))

  return (
    <>
      <main class="scroll-area">
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setCount(40)}>Add rows</button>
          <button onClick={() => setCount(3)}>Remove rows</button>
          <button onClick={() => api().scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
        </div>
        <div {...api().getRootProps()}>
          <div {...api().getViewportProps()}>
            <div {...api().getContentProps()}>
              <For each={Array.from({ length: count() })}>{(_, index) => <div>Row {index() + 1}</div>}</For>
            </div>
          </div>
          <Show when={api().hasOverflowY}>
            <div {...api().getScrollbarProps({ orientation: "vertical" })}>
              <div {...api().getThumbProps({ orientation: "vertical" })} />
            </div>
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
