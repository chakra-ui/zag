import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiX } from "react-icons/hi"
import { Presence } from "../components/presence"
import styles from "../styles/machines/drawer.module.css"

type DrawerProps = Partial<drawer.Props>

export function Drawer(props: DrawerProps) {
  const service = useMachine(drawer.machine, {
    id: useId(),
    ...props,
    defaultSnapPoint: 1,
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <>
      <button className={styles.trigger} {...api.getTriggerProps()}>
        Open Drawer
      </button>
      <Presence className={styles.backdrop} {...api.getBackdropProps()} />
      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence className={styles.content} {...api.getContentProps()}>
          <div className={styles.grabber} {...api.getGrabberProps()}>
            <div
              className={styles.grabberIndicator}
              {...api.getGrabberIndicatorProps()}
            />
          </div>
          <div className={styles.contentInner}>
            <div className={styles.title} {...api.getTitleProps()}>
              Add New Contact
            </div>
            <label>
              <span>Name</span>
              <input type="text" />
            </label>
            <label>
              <span>Email</span>
              <input type="email" />
            </label>
            <div className={styles.contentButtons}>
              <button>Add Contact</button>
              <button onClick={() => api.setOpen(false)}>Cancel</button>
            </div>
          </div>
          <button
            className={styles.closeTrigger}
            {...api.getCloseTriggerProps()}
          >
            <HiX />
          </button>
        </Presence>
      </div>
    </>
  )
}
