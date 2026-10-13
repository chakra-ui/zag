import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/dialog.css"

export default function Page() {
  const service = useMachine(dialog.machine, { id: "1", modal: false })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main style={{ padding: "24px" }}>
      <button {...api().getTriggerProps()}>Open non-modal dialog</button>

      <div style={{ "margin-top": "24px", padding: "16px", border: "1px dashed #d1d5db", "border-radius": "8px" }}>
        <p style={{ color: "#6b7280", "font-size": "14px" }}>
          This area stays interactive while the dialog is open. Try typing below:
        </p>
        <input
          type="text"
          placeholder="Type something..."
          style={{
            width: "100%",
            padding: "8px 12px",
            "margin-top": "8px",
            border: "1px solid #e5e7eb",
            "border-radius": "6px",
            "font-size": "16px",
            outline: "none",
            "box-sizing": "border-box",
          }}
        />
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <Presence {...api().getContentProps()}>
            <h2 {...api().getTitleProps()}>Non-modal dialog</h2>
            <p {...api().getDescriptionProps()}>
              No backdrop, no focus trap, no scroll lock. The page behind stays fully interactive. Close with the button
              or Escape.
            </p>
            <button {...api().getCloseTriggerProps()}>
              <XIcon />
            </button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
