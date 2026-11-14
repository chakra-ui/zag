"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/menu.css"

export default function Page() {
  const secondaryRef = useRef<HTMLButtonElement>(null)
  const finalRef = useRef<HTMLButtonElement>(null)

  const service = useMachine(menu.machine, {
    id: useId(),
    initialFocusEl: () => secondaryRef.current,
    finalFocusEl: () => finalRef.current,
  })

  const contextService = useMachine(menu.machine, {
    id: useId(),
    finalFocusEl: () => finalRef.current,
  })

  const noFocusService = useMachine(menu.machine, {
    id: useId(),
    initialFocusEl: () => false,
  })

  const api = menu.connect(service, normalizeProps)
  const contextApi = menu.connect(contextService, normalizeProps)
  const noFocusApi = menu.connect(noFocusService, normalizeProps)

  return (
    <>
      <main>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button data-testid="trigger" {...api.getTriggerProps()}>
            Actions
          </button>
          <button data-testid="no-focus-trigger" {...noFocusApi.getTriggerProps()}>
            No initial focus
          </button>
          <button data-testid="final-focus" ref={finalRef}>
            Final focus target
          </button>
          <button data-testid="outside">Outside</button>
        </div>

        <div data-testid="context-trigger" {...contextApi.getContextTriggerProps()}>
          Right click here
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <button data-testid="primary">Primary</button>
              <button data-testid="secondary" ref={secondaryRef}>
                Secondary
              </button>
              <div {...api.getItemProps({ value: "edit" })}>Edit</div>
              <div {...api.getItemProps({ value: "duplicate" })}>Duplicate</div>
            </div>
          </div>
        </Portal>

        <Portal>
          <div {...contextApi.getPositionerProps()}>
            <div data-testid="context-content" {...contextApi.getContentProps()}>
              <div {...contextApi.getItemProps({ value: "rename" })}>Rename</div>
              <div {...contextApi.getItemProps({ value: "delete" })}>Delete</div>
            </div>
          </div>
        </Portal>

        <Portal>
          <div {...noFocusApi.getPositionerProps()}>
            <div data-testid="no-focus-content" {...noFocusApi.getContentProps()}>
              <div {...noFocusApi.getItemProps({ value: "a" })}>A</div>
              <div {...noFocusApi.getItemProps({ value: "b" })}>B</div>
            </div>
          </div>
        </Portal>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
