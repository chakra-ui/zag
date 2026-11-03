import { normalizeProps, useMachine } from "@zag-js/preact"
import * as presence from "@zag-js/presence"
import type { HTMLAttributes, Ref, RefObject } from "preact"
import { useEffect, useState } from "preact/hooks"

interface PresenceProps extends HTMLAttributes<HTMLDivElement> {
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
  ref?: Ref<HTMLDivElement> | undefined
}

export function Presence(props: PresenceProps) {
  const { hidden, lazyMount, skipAnimationOnMount, unmountOnExit, ref, ...rest } = props

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
}

function mergeRefs<T>(...refs: (RefObject<T | null> | Ref<T> | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null) {
        ;(ref as RefObject<T | null>).current = node
      }
    })
  }
}
