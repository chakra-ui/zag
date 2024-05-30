/* eslint-disable @next/next/no-img-element */
import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { useId, useState } from "react"

export function SignaturePad(props: { value?: string }) {
  const [url, setUrl] = useState(props.value ?? "")

  const [state, send] = useMachine(
    signaturePad.machine({
      id: useId(),
      onDrawEnd(details) {
        details.getDataUrl("image/png").then(setUrl)
      },
    }),
  )

  const api = signaturePad.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Signature Pad</label>

      <div {...api.getControlProps()}>
        <svg {...api.getSegmentProps()}>
          {api.paths.map((path, i) => (
            <path key={i} {...api.getSegmentPathProps({ path })} />
          ))}
          {api.currentPath && <path {...api.getSegmentPathProps({ path: api.currentPath })} />}
        </svg>

        <div {...api.getGuideProps()} />
      </div>

      <button {...api.getClearTriggerProps()}>X</button>

      <button
        onClick={() => {
          api.getDataUrl("image/png").then(setUrl)
        }}
      >
        Show Image
      </button>

      {url && <img alt="signature" src={url} />}
    </div>
  )
}
