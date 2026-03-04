import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { forwardRef } from "react"

interface PresenceProps extends React.HTMLAttributes<HTMLDivElement> {
  present?: boolean
  keepMounted?: boolean
  onExitComplete?: () => void
}

export const Presence = forwardRef<HTMLDivElement, PresenceProps>(
  function Presence(props, ref) {
    const {
      hidden,
      present = !hidden,
      keepMounted,
      onExitComplete,
      ...rest
    } = props

    const service = useMachine(presence.machine, {
      present,
      onExitComplete,
    })
    const api = presence.connect(service, normalizeProps)

    if (!api.present && !keepMounted) return null

    return (
      <div
        ref={mergeRefs(ref, (node: any) => api.setNode(node))}
        data-scope="presence"
        data-state={api.skip ? undefined : present ? "open" : "closed"}
        hidden={!api.present}
        {...rest}
      />
    )
  },
)

function mergeRefs<T>(
  ...refs: (
    | React.RefObject<T>
    | React.Ref<T>
    | ((node: T) => void)
    | null
    | undefined
  )[]
) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === "function") {
        ref(node)
      } else if ("current" in ref) {
        ref.current = node
      }
    })
  }
}
