import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiX } from "react-icons/hi"
import { Presence } from "../components/presence"
import styles from "../styles/machines/bottom-sheet.module.css"

type BottomSheetProps = Omit<bottomSheet.Props, "id">

export function BottomSheet(props: BottomSheetProps) {
  const service = useMachine(bottomSheet.machine, {
    id: useId(),
    ...props,
  })

  const api = bottomSheet.connect(service, normalizeProps)

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Open Bottom Sheet
      </button>
      <Presence className={styles.Backdrop} {...api.getBackdropProps()} />
      <Presence className={styles.Content} {...api.getContentProps()}>
        <div className={styles.Grabber} {...api.getGrabberProps()}>
          <div
            className={styles.GrabberIndicator}
            {...api.getGrabberIndicatorProps()}
          />
        </div>
        <div className={styles.ContentInner}>
          <div className={styles.Title} {...api.getTitleProps()}>
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
          <div className={styles.ContentButtons}>
            <button>Add Contact</button>
            <button onClick={() => api.setOpen(false)}>Cancel</button>
          </div>
        </div>
        <button className={styles.CloseTrigger} {...api.getCloseTriggerProps()}>
          <HiX />
        </button>
      </Presence>
    </>
  )
}
