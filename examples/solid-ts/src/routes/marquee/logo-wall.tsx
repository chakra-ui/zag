import * as marquee from "@zag-js/marquee"
import { marqueeBrands } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/marquee.css"

export default function Page() {
  const service = useMachine(marquee.machine, {
    id: createUniqueId(),
    autoFill: true,
    spacing: "1.5rem",
  })

  const api = createMemo(() => marquee.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="logo-wall">
          <div {...api().getRootProps()}>
            <div {...api().getEdgeProps({ side: "start" })} />

            <div {...api().getViewportProps()}>
              <For keyed={false} each={Array.from({ length: api().contentCount })}>
                {(_, index) => (
                  <div {...api().getContentProps({ index })}>
                    <For each={marqueeBrands}>
                      {(brand) => (
                        <div {...api().getItemProps()}>
                          <span class="wordmark">{brand}</span>
                        </div>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </div>

            <div {...api().getEdgeProps({ side: "end" })} />
          </div>
          <p class="hint">The logos repeat to fill the full width.</p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
