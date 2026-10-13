import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/qr-code.css"

export default function Page() {
  const service = useMachine(qrCode.machine, {
    id: createUniqueId(),
    value: "https://zagjs.com",
    // The logo hides the middle modules; the highest error correction recovers them
    encoding: { ecc: "H" },
  })

  const api = createMemo(() => qrCode.connect(service, normalizeProps))

  return (
    <main class="qr-code">
      <div class="vstack">
        <div {...api().getRootProps()}>
          <svg {...api().getFrameProps()}>
            <path {...api().getPatternProps()} />
          </svg>
          <div {...api().getOverlayProps()}>
            <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
          </div>
        </div>
        <span class="qr-caption">{api().value} · error correction H</span>
      </div>
    </main>
  )
}
