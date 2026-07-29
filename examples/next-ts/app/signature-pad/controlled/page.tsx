"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { RotateCcw } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/signature-pad.css"

export default function Page() {
  const [paths, setPaths] = useState<string[]>([])
  const [url, setUrl] = useState("")

  const service = useMachine(signaturePad.machine, {
    id: useId(),
    paths,
    onDraw(details) {
      setPaths(details.paths)
    },
    onDrawEnd(details) {
      details.getDataUrl("image/png").then(setUrl)
    },
    drawing: {
      fill: "red",
      size: 4,
      simulatePressure: true,
    },
  })

  const api = signaturePad.connect(service, normalizeProps)

  return (
    <>
      <main className="signature-pad">
        <div {...api.getRootProps()}>
          <input {...api.getHiddenInputProps({ value: url })} />
          <label {...api.getLabelProps()}>Controlled Signature Pad</label>

          <div {...api.getControlProps()}>
            <svg {...api.getSegmentProps()}>
              {api.paths.map((path, i) => (
                <path key={i} {...api.getSegmentPathProps({ path })} />
              ))}
              {api.currentPath && <path {...api.getSegmentPathProps({ path: api.currentPath })} />}
            </svg>

            <div {...api.getGuideProps()} />
          </div>

          <button {...api.getClearTriggerProps()}>
            <RotateCcw />
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button data-testid="clear-paths" type="button" onClick={() => setPaths([])}>
            Clear (controlled)
          </button>
          <button
            type="button"
            onClick={() => {
              api.getDataUrl("image/png").then(setUrl)
            }}
          >
            Show Image
          </button>
        </div>

        <div
          data-testid="controlled-status"
          style={{ marginTop: "1rem", padding: "0.5rem", background: "#f5f5f5", borderRadius: "4px" }}
        >
          <div>
            <strong>Paths:</strong> {paths.length}
          </div>
          <div>
            <strong>Drawing:</strong> {api.drawing ? "yes" : "no"}
          </div>
          <div>
            <strong>Current path:</strong> {api.currentPath ? "active" : "none"}
          </div>
        </div>

        {url && <img data-part="preview" alt="signature" src={url} />}
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["paths", "currentPath"]} omit={["currentPoints"]} />
      </Toolbar>
    </>
  )
}
