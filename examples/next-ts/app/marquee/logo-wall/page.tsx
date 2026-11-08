"use client"

import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/react"
import { marqueeBrands } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/marquee.css"

export default function Page() {
  const service = useMachine(marquee.machine, {
    id: useId(),
    autoFill: true,
    spacing: "2rem",
  })

  const api = marquee.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="logo-wall">
          <div {...api.getRootProps()}>
            <div {...api.getEdgeProps({ side: "start" })} />

            <div {...api.getViewportProps()}>
              {Array.from({ length: api.contentCount }).map((_, index) => (
                <div key={index} {...api.getContentProps({ index })}>
                  {marqueeBrands.map((brand) => (
                    <div key={brand} {...api.getItemProps()}>
                      <span className="wordmark">{brand}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div {...api.getEdgeProps({ side: "end" })} />
          </div>
          <p className="hint">The logos repeat to fill the full width.</p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
