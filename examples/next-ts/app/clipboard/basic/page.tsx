"use client"

import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/react"
import { clipboardControls } from "@zag-js/shared"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/clipboard.css"

export default function Page() {
  const controls = useControls(clipboardControls)
  const [reports, setReports] = useState<string[]>([])

  const service = useMachine(clipboard.machine, {
    id: useId(),
    value: "https://github.com/chakra-ui/zag",
    onStatusChange(details) {
      setReports((prev) => [...prev, details.error ? "error" : details.copied ? "copied" : "reset"])
    },
    ...controls.context,
  })

  const api = clipboard.connect(service, normalizeProps)

  return (
    <>
      <main className="clipboard">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Copy this link</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
            <button {...api.getTriggerProps()}>{api.copied ? <ClipboardCheck /> : <ClipboardCopyIcon />}</button>
          </div>
          <div {...api.getIndicatorProps({ copied: true })}>Copied!</div>
          <div {...api.getIndicatorProps({ copied: false })}>Copy</div>
        </div>
        <p>
          onStatusChange: <output aria-label="Status reports">{reports.join(",") || "-"}</output>
        </p>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
