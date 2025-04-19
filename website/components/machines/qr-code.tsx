import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function QrCode(props: Omit<qrCode.Props, "id">) {
  const service = useMachine(qrCode.machine, {
    id: useId(),
    encoding: { ecc: "H" },
    ...props,
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <svg {...api.getFrameProps()}>
        <path {...api.getPatternProps()} />
      </svg>
      <div {...api.getOverlayProps()}>
        <img
          src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4"
          alt=""
        />
      </div>
    </div>
  )
}
