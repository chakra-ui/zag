import * as presence from "@zag-js/presence"
import { useMachine, normalizeProps } from "@zag-js/react"

interface PresenceProps {
  present: boolean
  keepMounted?: boolean
  onExitComplete?: () => void
}

export function Presence(props: PresenceProps) {
  const { keepMounted, present, onExitComplete, ...restProps } = props

  const [state, send] = useMachine(presence.machine({ present }), {
    context: { present, onExitComplete },
  })

  const api = presence.connect(state, send, normalizeProps)

  if (!api.present && !keepMounted) return null

  return (
    <div
      hidden={!api.present}
      data-presence
      data-state={api.skip ? undefined : present ? "open" : "closed"}
      ref={api.setNode}
      {...restProps}
    />
  )
}
