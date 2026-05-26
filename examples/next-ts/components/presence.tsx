import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { forwardRef, useEffect, useState } from "react"

interface PresenceProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to enable lazy mounting.
   */
  lazyMount?: boolean
  /**
   * Whether to skip the initial mount animation.
   */
  skipAnimationOnMount?: boolean
  /**
   * Whether to unmount the component when it's not present.
   */
  unmountOnExit?: boolean
}

export const Presence = forwardRef<HTMLDivElement, PresenceProps>(function Presence(props, ref) {
  const { hidden, lazyMount, skipAnimationOnMount, unmountOnExit, ...rest } = props

  const present = !hidden
  const service = useMachine(presence.machine, { present })
  const api = presence.connect(service, normalizeProps)

  const [wasEverPresent, setWasEverPresent] = useState(false)

  useEffect(() => {
    if (api.present) setWasEverPresent(true)
  }, [api.present])

  const unmounted = (!api.present && !wasEverPresent && lazyMount) || (unmountOnExit && !api.present && wasEverPresent)

  if (unmounted) return null

  return (
    <div
      ref={mergeRefs(ref, (node) => api.setNode(node))}
      data-scope="presence"
      data-state={api.skip && skipAnimationOnMount ? undefined : present ? "open" : "closed"}
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
