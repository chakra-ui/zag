import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as dialog from "@zag-js/dialog"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"

const Tooltip = () => {
  const service = useMachine(tooltip.machine, { id: useId() })
  const api = tooltip.connect(service, normalizeProps)
  return (
    <>
      <button {...api.getTriggerProps()}>Hover me</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>Tooltip</div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  const tooltipService = useMachine(tooltip.machine, { id: useId(), ids: { trigger: "t1" } })
  const dialogService = useMachine(dialog.machine, { id: useId(), ids: { trigger: "t1" } })

  const tooltipApi = tooltip.connect(tooltipService, normalizeProps)
  const dialogApi = dialog.connect(dialogService, normalizeProps)

  return (
    <main className="tooltip">
      <div className="root">
        <button {...mergeProps(tooltipApi.getTriggerProps(), dialogApi.getTriggerProps())}>Hover me</button>

        {tooltipApi.open && (
          <Portal>
            <div {...tooltipApi.getPositionerProps()}>
              <div {...tooltipApi.getContentProps()}>Tooltip</div>
            </div>
          </Portal>
        )}

        {dialogApi.open && (
          <Portal>
            <div {...dialogApi.getBackdropProps()} />
            <div {...dialogApi.getPositionerProps()}>
              <div {...dialogApi.getContentProps()}>
                <h2 {...dialogApi.getTitleProps()}>Edit profile</h2>
                <p {...dialogApi.getDescriptionProps()}>
                  Make changes to your profile here. Click save when you are done.
                </p>
                <div>
                  <Tooltip />
                  <input placeholder="Enter name..." />
                  <button>Save</button>
                </div>
                <button {...dialogApi.getCloseTriggerProps()}>Close</button>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </main>
  )
}
