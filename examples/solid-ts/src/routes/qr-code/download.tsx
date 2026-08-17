import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"

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
      <div {...api().getRootProps()}>
        <svg {...api().getFrameProps()}>
          <path {...api().getPatternProps()} />
        </svg>
        <div {...api().getOverlayProps()}>
          <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
        </div>
      </div>

      <button {...api().getDownloadTriggerProps({ mimeType: "image/png", quality: 1, fileName: "qr-code.png" })}>
        Download
      </button>
      <button onClick={() => api().getDataUrl("image/png", 1).then(setPreview)}>Preview</button>

      <Show when={preview()}>{(src) => <img width="120" height="120" src={src()} alt="qr-code preview" />}</Show>
    </main>
  )
}
