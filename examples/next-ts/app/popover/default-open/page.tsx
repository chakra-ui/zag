"use client"

import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { popoverControls } from "@zag-js/shared"
import { useId } from "react"
import { Presence } from "@/components/presence"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/popover.css"

export default function Page() {
  const controls = useControls(popoverControls)

  const service = useMachine(popover.machine, {
    id: useId(),
    defaultOpen: true,
    ...controls.context,
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <>
      <main className="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>

          <button data-testid="popover-trigger" {...api.getTriggerProps()}>
            Click me
            <div {...api.getIndicatorProps()}>{">"}</div>
          </button>

          <div {...api.getAnchorProps()}>anchor</div>

          <Portal>
            <div {...api.getPositionerProps()}>
              <Presence data-testid="popover-content" className="popover-content" {...api.getContentProps()}>
                <div {...api.getArrowProps()}>
                  <div {...api.getArrowTipProps()} />
                </div>
                <div data-testid="popover-title" {...api.getTitleProps()}>
                  Popover Title
                </div>
                <div data-part="body" data-testid="popover-body">
                  <a>Non-focusable Link</a>
                  <a href="#" data-testid="focusable-link">
                    Focusable Link
                  </a>
                  <input data-testid="input" placeholder="input" />
                  <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
                    X
                  </button>
                </div>
              </Presence>
            </div>
          </Portal>
          <span data-testid="plain-text">I am just text</span>
          <button data-testid="button-after">Button :after</button>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
