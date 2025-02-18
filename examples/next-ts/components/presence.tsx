import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { forwardRef, Ref, RefObject } from "react"

function usePresence(present: boolean) {
  const service = useMachine(presence.machine, { present })
  return presence.connect(service, normalizeProps)
}

interface PresenceProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Presence = forwardRef<HTMLDivElement, PresenceProps>((props: PresenceProps, ref) => {
  const { hidden, ...rest } = props

  const present = !hidden
  const api = usePresence(present)

  return (
    <div
      ref={mergeRefs(ref, (node) => api.setNode(node))}
      data-scope="presence"
      data-state={present ? "open" : "closed"}
      hidden={!api.present}
      {...rest}
    />
  )
})

function mergeRefs<T>(...refs: (RefObject<T> | Ref<T>)[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null) {
        // @ts-ignore
        ref.current = node
      }
    })
  }
}
