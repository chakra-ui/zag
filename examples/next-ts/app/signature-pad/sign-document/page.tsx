"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { RotateCcw } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/signature-pad.css"

export default function Page() {
  const [dataUrl, setDataUrl] = useState("")
  const [showError, setShowError] = useState(false)
  const [output, setOutput] = useState("")

  const service = useMachine(signaturePad.machine, {
    id: useId(),
    name: "signature",
    required: true,
    onDrawEnd: (details) => {
      setShowError(false)
      details.getDataUrl("image/png").then(setDataUrl)
    },
  })
  const api = signaturePad.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="signature-pad-sign-document">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              if (api.empty) {
                setShowError(true)
                return
              }
              const data = new FormData(event.currentTarget)
              setOutput(
                [...data.entries()]
                  .map(([key, value]) => `${key}=${String(value).slice(0, key === "signature" ? 32 : undefined)}`)
                  .join("\n"),
              )
            }}
            onReset={() => {
              api.clear()
              setDataUrl("")
              setShowError(false)
              setOutput("")
            }}
          >
            <label className="field">
              <span>Full name</span>
              <input name="signer" autoComplete="name" />
            </label>

            <div {...api.getRootProps()}>
              <input {...api.getHiddenInputProps({ value: api.empty ? "" : dataUrl })} />
              <label {...api.getLabelProps()}>Lease signature</label>
              <div {...api.getControlProps()}>
                <svg {...api.getSegmentProps()}>
                  {api.paths.map((path, index) => (
                    <path key={index} {...api.getSegmentPathProps({ path })} />
                  ))}
                  {api.currentPath && <path {...api.getSegmentPathProps({ path: api.currentPath })} />}
                </svg>
                <div {...api.getGuideProps()} />
              </div>
              <button {...api.getClearTriggerProps()}>
                <RotateCcw />
              </button>
            </div>
            {showError && <p className="error">Sign above to continue</p>}

            <div className="actions">
              <button type="submit">Sign lease</button>
              <button type="reset">Start over</button>
            </div>
          </form>
          {output && <pre>{output}</pre>}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
      </Toolbar>
    </>
  )
}
