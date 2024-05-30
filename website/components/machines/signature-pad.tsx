import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { useId } from "react"
import { BiRotateRight } from "react-icons/bi"

export function SignaturePad(props: any) {
  const [state, send] = useMachine(signaturePad.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = signaturePad.connect(state, send, normalizeProps)

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
