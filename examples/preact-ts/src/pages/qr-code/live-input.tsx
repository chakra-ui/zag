import { normalizeProps, useMachine } from "@zag-js/preact"
import * as qrCode from "@zag-js/qr-code"
import { useId, useState } from "preact/hooks"
import "@styles/qr-code.css"

export default function Page() {
  const [value, setValue] = useState("https://zagjs.com")
  const inputId = useId()

  const service = useMachine(qrCode.machine, {
    id: useId(),
    value,
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <main className="qr-code">
      <div className="vstack gap-4">
        <div className="vstack gap-2">
          <label htmlFor={inputId}>Text or URL</label>
          <input
            id={inputId}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            placeholder="Type something…"
            style={{ width: 240 }}
          />
        </div>

        <div {...api.getRootProps()}>
          <svg {...api.getFrameProps()}>
            <path {...api.getPatternProps()} />
          </svg>
        </div>

        <span className="qr-caption">{value.length} characters</span>
      </div>
    </main>
  )
}
