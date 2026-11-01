import * as dialog from "@zag-js/dialog"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/tooltip.css"
import "@styles/dialog.css"

function Tooltip() {
  const service = useMachine(tooltip.machine, { id: createUniqueId() })
  const api = createMemo(() => tooltip.connect(service, normalizeProps))
  return (
    <>
      <button {...api().getTriggerProps()}>Hover me</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>Tooltip</div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default function Page() {
  const tooltipService = useMachine(tooltip.machine, { id: createUniqueId(), ids: { trigger: "t1" } })
  const dialogService = useMachine(dialog.machine, { id: createUniqueId(), ids: { trigger: "t1" } })

  const tooltipApi = createMemo(() => tooltip.connect(tooltipService, normalizeProps))
  const dialogApi = createMemo(() => dialog.connect(dialogService, normalizeProps))

  const triggerProps = mergeProps(
    () => tooltipApi().getTriggerProps(),
    () => dialogApi().getTriggerProps(),
  )

  return (
    <main class="tooltip">
      <div class="root">
        <button {...triggerProps}>Hover me</button>

        <Show when={tooltipApi().open}>
          <Portal>
            <div {...tooltipApi().getPositionerProps()}>
              <div {...tooltipApi().getContentProps()}>Tooltip</div>
            </div>
          </Portal>
        </Show>

        <Show when={dialogApi().open}>
          <Portal>
            <div {...dialogApi().getBackdropProps()} />
            <div {...dialogApi().getPositionerProps()}>
              <div {...dialogApi().getContentProps()}>
                <h2 {...dialogApi().getTitleProps()}>Edit profile</h2>
                <p {...dialogApi().getDescriptionProps()}>
                  Make changes to your profile here. Click save when you are done.
                </p>
                <div>
                  <Tooltip />
                  <input placeholder="Enter name..." />
                  <button>Save</button>
                </div>
                <button {...dialogApi().getCloseTriggerProps()}>
                  <XIcon />
                </button>
              </div>
            </div>
          </Portal>
        </Show>
      </div>
    </main>
  )
}
