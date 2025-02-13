import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { qrCodeControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(qrCodeControls)

  const service = useMachine(qrCode.machine, {
    id: createUniqueId(),
    encoding: { ecc: "H" },
  })

  const api = createMemo(() => qrCode.connect(service, normalizeProps))

  return (
    <>
      <main class="qr-code">
        <div {...api().getRootProps()}>
          <svg {...api().getFrameProps()}>
            <path {...api().getPatternProps()} />
          </svg>
          <div {...api().getOverlayProps()}>
            <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["encoded"]} />
      </Toolbar>
    </>
  )
}
