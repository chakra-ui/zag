import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/qr-code.css"

export default function Page() {
  const [value, setValue] = createSignal("https://zagjs.com")
  const inputId = createUniqueId()

  const id = createUniqueId()
  const service = useMachine(qrCode.machine, () => ({
    id,
    value: value(),
  }))

  const api = createMemo(() => qrCode.connect(service, normalizeProps))

  return (
    <main class="qr-code">
      <div class="vstack gap-4">
        <div class="vstack gap-2">
          <label for={inputId}>Text or URL</label>
          <input
            id={inputId}
            value={value()}
            onInput={(e) => setValue(e.currentTarget.value)}
            placeholder="Type something…"
            style={{ width: "240px" }}
          />
        </div>

        <div {...api().getRootProps()}>
          <svg {...api().getFrameProps()}>
            <path {...api().getPatternProps()} />
          </svg>
        </div>

        <span class="qr-caption">{value().length} characters</span>
      </div>
    </main>
  )
}
