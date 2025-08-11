import * as scrollView from "@zag-js/scroll-view"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const service = useMachine(scrollView.machine, {
    id: createUniqueId(),
  })

  const api = createMemo(() => scrollView.connect(service, normalizeProps))

  return (
    <>
      <main class="scroll-view">
        <div {...api().getRootProps()}>
          <div {...api().getViewportProps()}>
            <div {...api().getContentProps()}>
              <For each={Array.from({ length: 100 })}>{(_, index) => <div>{index()}</div>}</For>
            </div>
          </div>
          <div {...api().getScrollbarProps()}>
            <div {...api().getThumbProps()} />
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
