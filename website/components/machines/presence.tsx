import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

interface AnimatePresenceProps extends React.ComponentPropsWithoutRef<"div"> {
  open: boolean
  keepMounted?: boolean
  onExitComplete?: () => void
}

function AnimatePresence(props: AnimatePresenceProps) {
  const { keepMounted, open, onExitComplete, ...rest } = props

  const service = useMachine(presence.machine, {
    present: open,
    onExitComplete,
  })

  const api = presence.connect(service, normalizeProps)

  if (!api.present && !keepMounted) return null

  return (
    <div
      hidden={!api.present}
      data-presence
      data-state={api.skip ? undefined : open ? "open" : "closed"}
      ref={api.setNode}
      {...rest}
    />
  )
}

export const Presence = () => {
  const [open, setOpen] = useState(true)
  const [unmounted, setUnmounted] = useState(false)

  return (
    <div className="presence">
      <output>
        Open {String(open)}, Unmounted: {String(unmounted)}
      </output>
      <button
        onClick={() =>
          setOpen((prevOpen) => {
            setUnmounted(false)
            return !prevOpen
          })
        }
      >
        Toggle
      </button>
      <AnimatePresence
        open={open}
        keepMounted
        onExitComplete={() => setUnmounted(true)}
      >
        <div>Content</div>
      </AnimatePresence>
    </div>
  )
}
