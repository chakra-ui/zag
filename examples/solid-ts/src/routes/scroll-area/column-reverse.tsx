import * as scrollArea from "@zag-js/scroll-area"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Index, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/scroll-area.css"

const items = Array.from({ length: 100 }, (_, index) => index)

export default function Page() {
  const service = useMachine(scrollArea.machine, {
    id: createUniqueId(),
  })

  const api = createMemo(() => scrollArea.connect(service, normalizeProps))

  return (
    <>
      <main class="scroll-area">
        <div {...api().getRootProps()}>
          <div {...api().getViewportProps()}>
            <div
              {...mergeProps(() => api().getContentProps(), {
                style: { display: "flex", "flex-direction": "column-reverse" },
              })}
            >
              <Index each={items}>{(index) => <div>Item {index()}</div>}</Index>
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
