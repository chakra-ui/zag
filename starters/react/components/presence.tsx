import * as presence from "@zag-js/presence"
import { useMachine, normalizeProps } from "@zag-js/react"
import * as React from "react"

interface UsePresenceProps {
  present: boolean
  keepMounted?: boolean
  onExitComplete?: () => void
}

export function usePresence(props: UsePresenceProps) {
  const { keepMounted, present, onExitComplete } = props

  const [state, send] = useMachine(presence.machine({ present }), {
    context: { present, onExitComplete },
  })

  const api = presence.connect(state, send, normalizeProps)

  return {
    unmount: !api.present && !keepMounted,
    attrs: {
      hidden: !api.present,
      "data-state": api.skip ? undefined : present ? "open" : "closed",
      ref: api.setNode,
    },
  }
}

function getChild(children: React.ReactNode) {
  const child: React.ReactNode = Array.isArray(children) ? React.Children.only(children) : children
  return React.isValidElement(child) ? child : undefined
}

interface AnimatedPresenceProps {
  onExitComplete?: () => void
  children: React.ReactNode
}

export function AnimatePresence(props: AnimatedPresenceProps) {
  const { children, onExitComplete } = props

  const presence = usePresence({
    present: !!children,
    keepMounted: false,
    onExitComplete,
  })

  const lastPresentChild = React.useRef<React.ReactNode>(null)

  const child = getChild(children)

  React.useLayoutEffect(() => {
    if (child) {
      lastPresentChild.current = child
    }
  }, [child])

  if (presence.unmount) return null

  const renderChild = child || lastPresentChild.current

  if (React.isValidElement(renderChild)) {
    return React.cloneElement(renderChild, presence.attrs)
  }

  return null
}
