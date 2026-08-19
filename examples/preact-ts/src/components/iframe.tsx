import { useId, useState } from "react"
import { createPortal } from "react-dom"

type IFrameProps = React.ComponentProps<"iframe">

export const IFrame = function IFrame(props: IFrameProps) {
  const { children, ...rest } = props

  const [frameRef, setFrameRef] = useState<HTMLIFrameElement | null>(null)
  const mountNode = frameRef?.contentWindow?.document.body

  return (
    <iframe title={`frame:${useId()}`} ref={setFrameRef} {...rest}>
      {mountNode ? createPortal(children, mountNode) : null}
    </iframe>
  )
}
