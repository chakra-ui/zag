import { normalizeProps, useMachine } from "@zag-js/react"
import * as signaturePad from "@zag-js/signature-pad"
import { useId } from "react"
import { BiRotateRight } from "react-icons/bi"
import styles from "../styles/machines/signature-pad.module.css"

interface SignaturePadProps extends Omit<signaturePad.Props, "id"> {}

export function SignaturePad(props: SignaturePadProps) {
  const service = useMachine(signaturePad.machine, {
    id: useId(),
    ...props,
  })

  const api = signaturePad.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Sign here
      </label>

      <div className={styles.Control} {...api.getControlProps()}>
        <svg className={styles.Segment} {...api.getSegmentProps()}>
          {api.paths.map((path, i) => (
            <path key={i} {...api.getSegmentPathProps({ path })} />
          ))}
          {api.currentPath && (
            <path {...api.getSegmentPathProps({ path: api.currentPath })} />
          )}
        </svg>

        <button className={styles.ClearTrigger} {...api.getClearTriggerProps()}>
          <BiRotateRight />
        </button>

        <div className={styles.Guide} {...api.getGuideProps()} />
      </div>
    </div>
  )
}
