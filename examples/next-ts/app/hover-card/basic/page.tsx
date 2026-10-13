"use client"

import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { hoverCardControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/hover-card.css"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const service = useMachine(hoverCard.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <>
      <main className="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" {...api.getTriggerProps()}>
            @zag_js
          </a>

          {api.open && (
            <Portal>
              <div {...api.getPositionerProps()}>
                <div {...api.getContentProps()}>
                  <div {...api.getArrowProps()}>
                    <div {...api.getArrowTipProps()} />
                  </div>
                  <div className="profile">
                    <span className="profile-avatar" aria-hidden>
                      Z
                    </span>
                    <div className="profile-body">
                      <span className="profile-name">Zag.js</span>
                      <span className="profile-handle">@zag_js</span>
                      <p className="profile-bio">
                        UI components powered by finite state machines. Works with React, Solid, Vue and Svelte.
                      </p>
                      <a className="profile-meta" href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                        twitter.com/zag_js
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Portal>
          )}

          <div data-testid="test-text">Test text</div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
