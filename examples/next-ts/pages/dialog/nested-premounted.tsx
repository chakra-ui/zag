import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

// Every positioner stays mounted while closed, so its portal is in the DOM before any dialog opens
export default function Page() {
  const service1 = useMachine(dialog.machine, { id: useId() })
  const dialog1 = dialog.connect(service1, normalizeProps)

  const service2 = useMachine(dialog.machine, { id: useId() })
  const dialog2 = dialog.connect(service2, normalizeProps)

  const service3 = useMachine(dialog.machine, { id: useId() })
  const dialog3 = dialog.connect(service3, normalizeProps)

  const menuService = useMachine(menu.machine, { id: useId() })
  const actions = menu.connect(menuService, normalizeProps)

  return (
    <>
      <main>
        <button {...dialog1.getTriggerProps()} data-testid="trigger-1">
          Open Dialog 1
        </button>

        <Portal>
          <div {...dialog1.getBackdropProps()} />
          <div data-testid="positioner-1" {...dialog1.getPositionerProps()}>
            <div data-testid="content-1" {...dialog1.getContentProps()}>
              <h2 {...dialog1.getTitleProps()}>Dialog 1</h2>
              <button {...dialog2.getTriggerProps()} data-testid="trigger-2">
                Open Dialog 2
              </button>
              <button {...actions.getTriggerProps()} data-testid="menu-trigger">
                Actions
              </button>
              <button {...dialog1.getCloseTriggerProps()} data-testid="close-1">
                Close
              </button>
            </div>
          </div>
        </Portal>

        <Portal>
          <div {...dialog2.getBackdropProps()} />
          <div data-testid="positioner-2" {...dialog2.getPositionerProps()}>
            <div data-testid="content-2" {...dialog2.getContentProps()}>
              <h2 {...dialog2.getTitleProps()}>Dialog 2</h2>
              <button onClick={() => dialog3.setOpen(true)} data-testid="open-3">
                Open Dialog 3
              </button>
              <button {...dialog2.getCloseTriggerProps()} data-testid="close-2">
                Close
              </button>
            </div>
          </div>
        </Portal>

        <Portal>
          <div {...dialog3.getBackdropProps()} />
          <div data-testid="positioner-3" {...dialog3.getPositionerProps()}>
            <div data-testid="content-3" {...dialog3.getContentProps()}>
              <h2 {...dialog3.getTitleProps()}>Dialog 3</h2>
              <button {...dialog3.getCloseTriggerProps()} data-testid="close-3">
                Close
              </button>
            </div>
          </div>
        </Portal>

        <Portal>
          <div data-testid="menu-positioner" {...actions.getPositionerProps()}>
            <ul data-testid="menu-content" {...actions.getContentProps()}>
              <li {...actions.getItemProps({ value: "rename" })}>Rename</li>
              <li {...actions.getItemProps({ value: "delete" })}>Delete</li>
            </ul>
          </div>
        </Portal>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer label="Dialog 1" state={service1} />
        <StateVisualizer label="Dialog 2" state={service2} />
        <StateVisualizer label="Dialog 3" state={service3} />
      </Toolbar>
    </>
  )
}
