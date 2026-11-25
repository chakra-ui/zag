import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      <main>
        <button {...api.getTriggerProps()} data-testid="trigger-1">
          Open dialog
        </button>
        <Portal>
          <Presence {...api.getBackdropProps()} lazyMount unmountOnExit />
          <Presence {...api.getPositionerProps()} hidden={!api.open} lazyMount unmountOnExit data-testid="positioner-1">
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <input placeholder="Enter name..." data-testid="input-1" />
              <button>Save</button>
              <button {...api.getCloseTriggerProps()} data-testid="close-1">
                Close
              </button>
            </div>
          </Presence>
        </Portal>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
