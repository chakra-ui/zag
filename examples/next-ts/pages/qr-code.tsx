/* eslint-disable jsx-a11y/alt-text */
import * as qrCode from "@zag-js/qr-code"
import { useMachine, normalizeProps } from "@zag-js/react"
import { qrCodeControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(qrCodeControls)

  const [state, send] = useMachine(
    qrCode.machine({
      id: useId(),
      encoding: { ecc: "H" },
    }),
    {
      context: controls.context,
    },
  )

  const api = qrCode.connect(state, send, normalizeProps)

  return (
    <>
      <main className="qr-code">
        <div {...api.getRootProps()}>
          <svg {...api.getFrameProps()}>
            <path {...api.getPatternProps()} />
          </svg>
          <div {...api.getOverlayProps()}>
            <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["encoded"]} />
      </Toolbar>
    </>
  )
}
