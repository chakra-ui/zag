import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import { useId, useRef } from "preact/hooks"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/menu.css"
import "@styles/dialog.css"

export default function Page() {
  const triggerRef = useRef<HTMLButtonElement>(null)

  const menuService = useMachine(menu.machine, {
    id: useId(),
    onSelect({ value }) {
      if (value === "delete") dialogApi.setOpen(true)
    },
  })
  const menuApi = menu.connect(menuService, normalizeProps)

  const dialogService = useMachine(dialog.machine, {
    id: useId(),
    role: "alertdialog",
    // Back to the trigger, since the item that opened the dialog is gone
    finalFocusEl: () => triggerRef.current,
  })
  const dialogApi = dialog.connect(dialogService, normalizeProps)

  return (
    <>
      <main>
        <button ref={triggerRef} {...menuApi.getTriggerProps()}>
          Actions <span {...menuApi.getIndicatorProps()}>▾</span>
        </button>
        <Portal>
          <div {...menuApi.getPositionerProps()}>
            <ul {...menuApi.getContentProps()}>
              <li {...menuApi.getItemProps({ value: "edit" })}>Edit</li>
              <li {...menuApi.getItemProps({ value: "duplicate" })}>Duplicate</li>
              <li {...menuApi.getItemProps({ value: "delete" })}>Delete…</li>
            </ul>
          </div>
        </Portal>

        <Portal>
          <Presence {...dialogApi.getBackdropProps()} />
          <div {...dialogApi.getPositionerProps()}>
            <Presence {...dialogApi.getContentProps()}>
              <h2 {...dialogApi.getTitleProps()}>Delete project?</h2>
              <p {...dialogApi.getDescriptionProps()}>This can't be undone.</p>
              <button {...dialogApi.getCloseTriggerProps()}>Cancel</button>
              <button onClick={() => dialogApi.setOpen(false)}>Delete</button>
            </Presence>
          </div>
        </Portal>
      </main>

      <Toolbar>
        <StateVisualizer state={menuService} />
      </Toolbar>
    </>
  )
}
