import * as marquee from "@zag-js/marquee"
import { marqueeQuotes } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/marquee.css"

export default function Page() {
  const [paused, setPaused] = createSignal(false)
  const [finished, setFinished] = createSignal(false)

  const service = useMachine(marquee.machine, () => ({
    id: createUniqueId(),
    speed: 200,
    spacing: "2rem",
    loopCount: 2,
    pauseOnInteraction: true,
    paused: paused(),
    onPauseChange: (details) => setPaused(details.paused),
    onComplete: () => setFinished(true),
  }))

  const api = createMemo(() => marquee.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="ticker">
          <div {...api().getRootProps()}>
            <div {...api().getViewportProps()}>
              <For keyed={false} each={Array.from({ length: api().contentCount })}>
                {(_, index) => (
                  <div {...api().getContentProps({ index })}>
                    <For each={marqueeQuotes}>
                      {(quote) => (
                        <div {...api().getItemProps()}>
                          <span class="symbol">{quote.symbol}</span>
                          <span>{quote.price}</span>
                          <span class={quote.trend === "up" ? "up" : "down"}>{quote.change}</span>
                        </div>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="controls">
            <button onClick={() => setPaused(!paused())}>{paused() ? "Resume" : "Pause"}</button>
            <span class="status" role="status" data-testid="status">
              {finished() ? "Finished" : ""}
            </span>
          </div>
          <p class="hint">Hover the ticker or press Pause. It stops after two loops.</p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
