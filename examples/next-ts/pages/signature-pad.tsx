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

  const [state, send] = useMachine(
    signaturePad.machine({
      id: useId(),
      onDrawEnd(details) {
        details.getDataUrl("image/png").then(setUrl)
      },
      drawing: {
        fill: "red",
        size: 4,
        simulatePressure: true,
      },
    }),
    { context: controls.context },
  )

  const api = signaturePad.connect(state, send, normalizeProps)

  return (
    <>
      <main className="signature-pad">
        <div {...api.rootProps}>
          <label {...api.labelProps}>Signature Pad</label>

          <div {...api.controlProps}>
            <svg {...api.layerProps}>
              {api.paths.map((path, i) => (
                <path key={i} {...api.getLayerPathProps({ path })} />
              ))}
              {api.currentPath && <path {...api.getLayerPathProps({ path: api.currentPath })} />}
            </svg>

            <div {...api.lineProps} />
          </div>

          <button {...api.clearTriggerProps}>
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
        <StateVisualizer state={state} omit={["points"]} />
      </Toolbar>
    </>
  )
}
