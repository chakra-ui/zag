import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { forwardRef, Ref } from "preact/compat"
import { useEffect, useRef, useState } from "preact/hooks"
import { JSX } from "preact"

interface PresenceProps extends JSX.HTMLAttributes<HTMLDivElement> {
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

  const internalRef = useRef<HTMLDivElement>(null)
  const mergedRef: Ref<HTMLDivElement> = (node) => {
    internalRef.current = node
    if (typeof ref === "function") {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }

  useEffect(() => {
    if (internalRef.current) {
      api.setNode(internalRef.current)
    }
  }, [])

  const unmounted = (!api.present && !wasEverPresent && lazyMount) || (unmountOnExit && !api.present && wasEverPresent)

  if (unmounted) return null

  return (
    <div
      ref={mergedRef}
      data-scope="presence"
      data-state={api.skip && skipAnimationOnMount ? undefined : present ? "open" : "closed"}
      hidden={!api.present}
      {...rest}
    />
  )
})
