import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiX } from "react-icons/hi"
import { Presence } from "../components/presence"

type BottomSheetProps = Omit<bottomSheet.Props, "id">

export function BottomSheet(props: BottomSheetProps) {
  const service = useMachine(bottomSheet.machine, {
    id: useId(),
    ...props,
  })

  const api = bottomSheet.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Open Bottom Sheet</button>
      <Presence {...api.getBackdropProps()} />
      <Presence {...api.getContentProps()}>
        <div {...api.getGrabberProps()}>
          <div {...api.getGrabberIndicatorProps()} />
        </div>
        <div>
          <div {...api.getTitleProps()}>Add New Contact</div>
          <label>
            <span>Name</span>
            <input type="text" />
          </label>
          <label>
            <span>Email</span>
            <input type="email" />
          </label>
          <div>
            <button>Add Contact</button>
            <button onClick={() => api.setOpen(false)}>Cancel</button>
          </div>
        </div>
        <button {...api.getCloseTriggerProps()}>
          <HiX />
        </button>
      </Presence>
    </>
  )
}
