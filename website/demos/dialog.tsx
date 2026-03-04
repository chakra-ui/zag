import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { HiX } from "react-icons/hi"
import { useId } from "react"
import styles from "../styles/machines/dialog.module.css"

interface DialogProps extends Omit<dialog.Props, "id"> {}

export function Dialog(props: DialogProps) {
  const service = useMachine(dialog.machine, {
    id: useId(),
    ...props,
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Open Dialog
      </button>
      <Portal>
        <div className={styles.Backdrop} {...api.getBackdropProps()} />
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <h2 className={styles.Title} {...api.getTitleProps()}>
              Edit profile
            </h2>
            <p className={styles.Description} {...api.getDescriptionProps()}>
              Make changes to your profile here. Click save when you are done.
            </p>

            <div className={styles.Actions}>
              <input placeholder="Enter name..." />
              <button>Save</button>
            </div>
            <button
              className={styles.CloseTrigger}
              {...api.getCloseTriggerProps()}
            >
              <HiX />
            </button>
          </div>
        </div>
      </Portal>
    </>
  )
}
