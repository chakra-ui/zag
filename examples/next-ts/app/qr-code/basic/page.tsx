"use client"

import * as qrCode from "@zag-js/qr-code"
import { useMachine, normalizeProps } from "@zag-js/react"
import { qrCodeControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/qr-code.css"

export default function Page() {
  const controls = useControls(qrCodeControls)

  const service = useMachine(qrCode.machine, {
    id: useId(),
    encoding: { ecc: "H" },
    ...controls.context,
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <>
      <main className="qr-code">
        <div className="vstack">
          <div {...api.getRootProps()}>
            <svg {...api.getFrameProps()}>
              <path {...api.getPatternProps()} />
            </svg>
          </div>
          <span className="qr-caption">{api.value}</span>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["encoded"]} />
      </Toolbar>
    </>
  )
}
