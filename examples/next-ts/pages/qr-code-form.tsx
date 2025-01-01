import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [url, setUrl] = useState("")
  const [image, setImage] = useState("")
  const [state, send] = useMachine(
    qrCode.machine({
      id: useId(),
      encoding: { ecc: "H" },
    }),
    {
      context: { value: url },
    },
  )

  const api = qrCode.connect(state, send, normalizeProps)

  return (
    <main className="qr-code">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          const url = formData.get("url")?.toString()
          if (url) setUrl(url)
        }}
      >
        <input type="text" name="url" />
        <button type="submit">Generate</button>
      </form>

      {url && (
        <div {...api.getRootProps()}>
          <svg {...api.getFrameProps()}>
            <path {...api.getPatternProps()} />
          </svg>
        </div>
      )}

      <button onClick={() => api.getDataUrl("image/jpeg").then(setImage)}>Preview</button>
      {image && <img src={image} alt="QR Code" height={120} width={120} />}
    </main>
  )
}
