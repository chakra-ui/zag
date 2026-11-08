"use client"

import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/clipboard.css"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const generateKey = () =>
  "zag_live_" + Array.from({ length: 24 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")

export default function Page() {
  const [value, setValue] = useState("zag_live_51Hx8Kq2eZvKGdY4Tn9PzLm3W")
  const [status, setStatus] = useState("")

  const service = useMachine(clipboard.machine, {
    id: useId(),
    value,
    onStatusChange: (details) => setStatus(details.copied ? "Copied!" : ""),
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <>
      <main className="api-key">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Secret API key</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
            <button {...api.getTriggerProps()}>{api.copied ? <ClipboardCheck /> : <ClipboardCopyIcon />}</button>
          </div>
          <div className="actions">
            <button
              type="button"
              onClick={() => {
                setValue(generateKey())
                setStatus("")
              }}
            >
              Regenerate
            </button>
            <span data-testid="status">{status}</span>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
