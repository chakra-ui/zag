import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { useId, useState } from "react"

interface Props extends Omit<signaturePad.Props, "id"> {
  value?: string
}

export function SignaturePad(props: Props) {
  const { value, ...context } = props
  const [url, setUrl] = useState(value ?? "")

  const service = useMachine(signaturePad.machine, {
    id: useId(),
    onDrawEnd(details) {
      details.getDataUrl("image/png").then(setUrl)
    },
    ...context,
  })

  const api = signaturePad.connect(service, normalizeProps)

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
