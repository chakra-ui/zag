import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { forwardRef, Ref } from "preact/compat"
import { useEffect, useRef } from "preact/hooks"
import { JSX } from "preact"

interface PresenceProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Presence = forwardRef<HTMLDivElement, PresenceProps>(function Presence(props, ref) {
  const { hidden, ...rest } = props

  const present = !hidden
  const service = useMachine(presence.machine, { present })
  const api = presence.connect(service, normalizeProps)

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

  return (
    <div
      ref={mergedRef}
      data-scope="presence"
      data-state={api.skip ? undefined : present ? "open" : "closed"}
      hidden={!api.present}
      {...rest}
    />
  )
})
