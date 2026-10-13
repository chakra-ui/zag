import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import "@styles/qr-code.css"

export default function Page() {
  const [preview, setPreview] = createSignal<string | null>(null)

  const service = useMachine(qrCode.machine, {
    id: createUniqueId(),
    value: "https://zagjs.com",
    encoding: { ecc: "H" },
  })

  const api = createMemo(() => qrCode.connect(service, normalizeProps))

  return (
    <main class="qr-code">
      <div class="vstack gap-4">
        <div {...api().getRootProps()}>
          <svg {...api().getFrameProps()}>
            <path {...api().getPatternProps()} />
          </svg>
          <div {...api().getOverlayProps()}>
            <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
          </div>
        </div>

        <div class="hstack">
          <button {...api().getDownloadTriggerProps({ mimeType: "image/png", quality: 1, fileName: "qr-code.png" })}>
            Download PNG
          </button>
          <button onClick={() => api().getDataUrl("image/png", 1).then(setPreview)}>Show as image</button>
        </div>

        <Show when={preview()}>
          {(src) => (
            <div class="qr-tile">
              <img width="120" height="120" src={src()} alt="QR code exported as PNG" />
              <span>Exported PNG</span>
            </div>
          )}
        </Show>
      </div>
    </main>
  )
}
