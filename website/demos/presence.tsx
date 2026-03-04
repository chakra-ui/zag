import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"
import styles from "../styles/machines/presence.module.css"

export const Presence = () => {
  const [open, setOpen] = useState(true)
  const [unmounted, setUnmounted] = useState(false)

  return (
    <div className={styles.Root}>
      <output className={styles.Output}>
        Open {String(open)}, Unmounted: {String(unmounted)}
      </output>
      <button
        className={styles.Trigger}
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
        present={open}
        keepMounted
        onExitComplete={() => setUnmounted(true)}
      >
        <div>Content</div>
      </AnimatePresence>
    </div>
  )
}

interface AnimatePresenceProps extends React.ComponentPropsWithoutRef<"div"> {
  present: boolean
  keepMounted?: boolean
  onExitComplete?: () => void
}

function AnimatePresence(props: AnimatePresenceProps) {
  const { keepMounted, present, onExitComplete, ...rest } = props

  const service = useMachine(presence.machine, {
    present,
    onExitComplete,
  })

  const api = presence.connect(service, normalizeProps)

  if (!api.present && !keepMounted) return null

  return (
    <div
      hidden={!api.present}
      className={styles.Content}
      data-state={api.skip ? undefined : present ? "open" : "closed"}
      ref={api.setNode}
      {...rest}
    />
  )
}
