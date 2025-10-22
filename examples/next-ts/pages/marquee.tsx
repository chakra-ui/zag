import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/react"
import { marqueeControls, marqueeData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(marqueeControls)

  const service = useMachine(marquee.machine, {
    id: useId(),
    spacing: "2rem",
    ...controls.context,
  })

  const api = marquee.connect(service, normalizeProps)

  return (
    <>
      <main className="marquee">
        <div {...api.getRootProps()}>
          <div {...api.getEdgeProps({ side: "start" })} />

          <div {...api.getViewportProps()}>
            {Array.from({ length: api.contentCount }).map((_, index) => (
              <div key={index} {...api.getContentProps({ index })}>
                {marqueeData.map((item, i) => (
                  <div key={i} className="marquee-item">
                    <span className="marquee-logo">{item.logo}</span>
                    <span className="marquee-name">{item.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div {...api.getEdgeProps({ side: "end" })} />
        </div>

        <div className="controls">
          <button onClick={() => api.pause()}>Pause</button>
          <button onClick={() => api.resume()}>Resume</button>
          <button onClick={() => api.togglePause()}>Toggle</button>
          <span>Status: {api.paused ? "Paused" : "Playing"}</span>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
