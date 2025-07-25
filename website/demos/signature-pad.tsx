import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { useId } from "react"
import { BiRotateRight } from "react-icons/bi"

interface SignaturePadProps extends Omit<signaturePad.Props, "id"> {}

export function SignaturePad(props: SignaturePadProps) {
  const service = useMachine(signaturePad.machine, {
    id: useId(),
    ...props,
  })

  const api = signaturePad.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Sign here</label>

      <div {...api.getControlProps()}>
        <svg {...api.getSegmentProps()}>
          {api.paths.map((path, i) => (
            <path key={i} {...api.getSegmentPathProps({ path })} />
          ))}
          {api.currentPath && (
            <path {...api.getSegmentPathProps({ path: api.currentPath })} />
          )}
        </svg>

        <button {...api.getClearTriggerProps()}>
          <BiRotateRight />
        </button>

        <div {...api.getGuideProps()} />
      </div>
    </div>
  )
}
