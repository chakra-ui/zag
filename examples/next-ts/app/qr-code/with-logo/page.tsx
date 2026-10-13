"use client"

import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/qr-code.css"

export default function Page() {
  const service = useMachine(qrCode.machine, {
    id: useId(),
    value: "https://zagjs.com",
    // The logo hides the middle modules; the highest error correction recovers them
    encoding: { ecc: "H" },
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <main className="qr-code">
      <div className="vstack">
        <div {...api.getRootProps()}>
          <svg {...api.getFrameProps()}>
            <path {...api.getPatternProps()} />
          </svg>
          <div {...api.getOverlayProps()}>
            <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
          </div>
        </div>
        <span className="qr-caption">{api.value} · error correction H</span>
      </div>
    </main>
  )
}
