"use client"

import styles from "@styles/drawer.module.css"
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { useId } from "react"
import { Presence } from "@/components/presence"

export default function Page() {
  const service = useMachine(drawer.machine, {
    id: useId(),
    modal: false,
    closeOnInteractOutside: false,
    swipeDirection: "end",
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <main style={{ padding: 24 }}>
      <button className={styles.trigger} {...api.getTriggerProps()}>
        Open Drawer
      </button>

      <div style={{ marginTop: 24, padding: 16, border: "1px dashed #d1d5db", borderRadius: 8 }}>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          This area stays interactive while the drawer is open. Try typing below:
        </p>
        <input
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

      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence className={styles.content} {...api.getContentProps()}>
          <div {...api.getTitleProps()}>Non-modal Drawer</div>
          <p {...api.getDescriptionProps()} style={{ color: "#6b7280", margin: "8px 0 0", padding: "0 16px" }}>
            No backdrop, no focus trap, no scroll lock. The page behind stays fully interactive. Close with the button,
            drag to dismiss, or Escape.
          </p>
          <div style={{ padding: 16 }}>
            <button {...api.getCloseTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </Presence>
      </div>
    </main>
  )
}
