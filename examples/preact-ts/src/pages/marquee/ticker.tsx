import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { marqueeQuotes } from "@zag-js/shared"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/marquee.css"

export default function Page() {
  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)

  const service = useMachine(marquee.machine, {
    id: useId(),
    speed: 200,
    spacing: "2rem",
    loopCount: 2,
    pauseOnInteraction: true,
    paused,
    onPauseChange: (details) => setPaused(details.paused),
    onComplete: () => setFinished(true),
  })

  const api = marquee.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="ticker">
          <div {...api.getRootProps()}>
            <div {...api.getViewportProps()}>
              {Array.from({ length: api.contentCount }).map((_, index) => (
                <div key={index} {...api.getContentProps({ index })}>
                  {marqueeQuotes.map((quote) => (
                    <div key={quote.symbol} {...api.getItemProps()}>
                      <span className="symbol">{quote.symbol}</span>
                      <span>{quote.price}</span>
                      <span className={quote.trend === "up" ? "up" : "down"}>{quote.change}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="controls">
            <button onClick={() => setPaused(!paused)}>{paused ? "Resume" : "Pause"}</button>
            <span className="status" role="status" data-testid="status">
              {finished ? "Finished" : ""}
            </span>
          </div>
          <p className="hint">Hover the ticker or press Pause. It stops after two loops.</p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
