"use client"

import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { Presence } from "@/components/presence"
import "@styles/dialog.css"

export default function Page() {
  const service = useMachine(dialog.machine, { id: "1", modal: false, closeOnInteractOutside: true })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main style={{ padding: 24 }}>
      <button data-testid="trigger-1" {...api.getTriggerProps()}>
        Open non-modal dialog
      </button>

      <div style={{ marginTop: 24, padding: 16, border: "1px dashed #d1d5db", borderRadius: 8 }}>
        <p data-testid="outside-content" style={{ color: "#6b7280", fontSize: 14 }}>
          This area stays interactive while the dialog is open. Try typing below:
        </p>
        <input
          data-testid="outside-input"
          type="text"
          placeholder="Type something..."
          style={{
            width: "100%",
            padding: "8px 12px",
            marginTop: 8,
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            fontSize: 16,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <Portal>
        <div data-testid="positioner-1" {...api.getPositionerProps()}>
          <Presence {...api.getContentProps()}>
            <h2 {...api.getTitleProps()}>Non-modal dialog</h2>
            <p {...api.getDescriptionProps()}>
              No backdrop, no focus trap, no scroll lock. The page behind stays fully interactive. Close with the button
              or Escape.
            </p>
            <button data-testid="close-1" {...api.getCloseTriggerProps()}>
              <XIcon />
            </button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
