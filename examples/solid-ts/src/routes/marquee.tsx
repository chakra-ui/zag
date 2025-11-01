import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For, Index } from "solid-js"
import { marqueeControls, marqueeData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(marqueeControls)

  const service = useMachine(
    marquee.machine,
    controls.mergeProps({
      id: createUniqueId(),
      spacing: "2rem",
    }),
  )

  const api = createMemo(() => marquee.connect(service, normalizeProps))

  return (
    <>
      <main class="marquee">
        <div {...api().getRootProps()}>
          <div {...api().getEdgeProps({ side: "start" })} />

          <div {...api().getViewportProps()}>
            <Index each={Array.from({ length: api().contentCount })}>
              {(_, index) => (
                <div {...api().getContentProps({ index })}>
                  <For each={marqueeData}>
                    {(item) => (
                      <div {...api().getItemProps()}>
                        <span class="marquee-logo">{item.logo}</span>
                        <span class="marquee-name">{item.name}</span>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </Index>
          </div>

          <div {...api().getEdgeProps({ side: "end" })} />
        </div>

        <div class="controls">
          <button onClick={() => api().pause()}>Pause</button>
          <button onClick={() => api().resume()}>Resume</button>
          <button onClick={() => api().togglePause()}>Toggle</button>
          <span>Status: {api().paused ? "Paused" : "Playing"}</span>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
