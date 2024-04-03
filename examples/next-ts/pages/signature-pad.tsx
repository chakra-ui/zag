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
      onValueChangeEnd(e) {
        setUrl(e.dataUrl("image/png"))
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

            <div {...api.separatorProps} />
          </div>

          <button {...api.clearTriggerProps}>
            <RotateCcw />
          </button>
        </div>

        <button onClick={() => setUrl(api.getDataUrl("image/png"))}>Show Image</button>
        {url && <img style={{ height: "140px", objectFit: "cover", maxWidth: "100%" }} alt="signature" src={url} />}
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["points"]} />
      </Toolbar>
    </>
  )
}
