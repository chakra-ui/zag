import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { forwardRef } from "react"

interface PresenceProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Presence = forwardRef<HTMLDivElement, PresenceProps>(function Presence(props, ref) {
  const { hidden, ...rest } = props

  const present = !hidden
  const service = useMachine(presence.machine, { present })
  const api = presence.connect(service, normalizeProps)

  return (
    <div
      ref={mergeRefs(ref, (node) => api.setNode(node))}
      data-scope="presence"
      data-state={api.skip ? undefined : present ? "open" : "closed"}
      hidden={!api.present}
      {...rest}
    />
  )
})

function mergeRefs<T>(...refs: (React.RefObject<T> | React.Ref<T>)[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null) {
        ref.current = node
      }
    })
  }
}
