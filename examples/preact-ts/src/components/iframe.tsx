import { createPortal, type ComponentProps } from "preact"
import { useId, useState } from "preact/hooks"

type IFrameProps = ComponentProps<"iframe">

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
