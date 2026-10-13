"use client"

import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/qr-code.css"

export default function Page() {
  const [preview, setPreview] = useState<string | null>(null)

  const service = useMachine(qrCode.machine, {
    id: useId(),
    value: "https://zagjs.com",
    encoding: { ecc: "H" },
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <main className="qr-code">
      <div className="vstack gap-4">
        <div {...api.getRootProps()}>
          <svg {...api.getFrameProps()}>
            <path {...api.getPatternProps()} />
          </svg>
          <div {...api.getOverlayProps()}>
            <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
          </div>
        </div>

        <div className="hstack">
          <button {...api.getDownloadTriggerProps({ mimeType: "image/png", quality: 1, fileName: "qr-code.png" })}>
            Download PNG
          </button>
          <button onClick={() => api.getDataUrl("image/png", 1).then(setPreview)}>Show as image</button>
        </div>

        {preview && (
          <div className="qr-tile">
            <img width="120" height="120" src={preview} alt="QR code exported as PNG" />
            <span>Exported PNG</span>
          </div>
        )}
      </div>
    </main>
  )
}
