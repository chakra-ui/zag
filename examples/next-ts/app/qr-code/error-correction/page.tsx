"use client"

import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/qr-code.css"

type Ecc = "L" | "M" | "Q" | "H"

const levels: { ecc: Ecc; recovery: string }[] = [
  { ecc: "L", recovery: "~7% recoverable" },
  { ecc: "M", recovery: "~15% recoverable" },
  { ecc: "Q", recovery: "~25% recoverable" },
  { ecc: "H", recovery: "~30% recoverable" },
]

// Higher levels add redundancy: the same value needs more modules
function Level(props: { ecc: Ecc; recovery: string }) {
  const service = useMachine(qrCode.machine, {
    id: useId(),
    value: "https://zagjs.com",
    encoding: { ecc: props.ecc },
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <div className="qr-tile">
      <div {...api.getRootProps()} style={{ "--qr-size": "120px" } as React.CSSProperties}>
        <svg {...api.getFrameProps()}>
          <path {...api.getPatternProps()} />
        </svg>
      </div>
      <strong>Level {props.ecc}</strong>
      <span>{props.recovery}</span>
    </div>
  )
}

export default function Page() {
  return (
    <main className="qr-code">
      <div className="hstack gap-5">
        {levels.map((level) => (
          <Level key={level.ecc} {...level} />
        ))}
      </div>
    </main>
  )
}
