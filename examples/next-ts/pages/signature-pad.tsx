import { normalizeProps, useMachine } from "@zag-js/react"
import { signaturePadControls } from "@zag-js/shared"
import * as signaturePad from "@zag-js/signature-pad"
import { RotateCcw } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const [url, setUrl] = useState("")

  const controls = useControls(signaturePadControls)

  const service = useMachine(signaturePad.machine, {
    id: useId(),
    onDrawEnd(details) {
      details.getDataUrl("image/png").then(setUrl)
    },
    drawing: {
      fill: "red",
      size: 4,
      simulatePressure: true,
    },
    ...controls.context,
  })

  const api = signaturePad.connect(service, normalizeProps)

  return (
    <>
      <main className="signature-pad">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Signature Pad</label>

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

        <button
          onClick={() => {
            api.getDataUrl("image/png").then(setUrl)
          }}
        >
          Show Image
        </button>
        {url && <img data-part="preview" alt="signature" src={url} />}
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["currentPoints", "currentPath", "paths"]} />
      </Toolbar>
    </>
  )
}
