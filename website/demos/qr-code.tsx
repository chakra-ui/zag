import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/qr-code.module.css"

interface QrCodeProps extends Omit<qrCode.Props, "id"> {}

export function QrCode(props: QrCodeProps) {
  const service = useMachine(qrCode.machine, {
    id: useId(),
    ...props,
    encoding: { ecc: "H", ...props.encoding },
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <svg className={styles.Frame} {...api.getFrameProps()}>
        <path className={styles.Pattern} {...api.getPatternProps()} />
      </svg>
      <div className={styles.Overlay} {...api.getOverlayProps()}>
        <img
          src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4"
          alt=""
        />
      </div>
    </div>
  )
}
