import { toastControls } from "@zag-js/shared"
import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { ToastItem } from "~/components/toast-item"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

export default function Page() {
  const controls = useControls(toastControls)
  const service = useMachine(toast.group.machine, controls.mergeProps({ id: createUniqueId(), store: toaster }))
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="hstack">
          <button
            onClick={() => toaster.create({ title: "Event created", description: "Sunday, December 3 at 9:00 AM" })}
          >
            Show toast
          </button>
          <button onClick={() => toaster.success({ title: "Changes saved" })}>Success</button>
          <button
            onClick={() => toaster.error({ title: "Couldn't save changes", description: "Check your connection." })}
          >
            Error
          </button>
          <button onClick={() => toaster.warning({ title: "Storage almost full", description: "90% of 5 GB used." })}>
            Warning
          </button>
          <button onClick={() => toaster.info({ title: "A new version is available" })}>Info</button>
          <button onClick={() => toaster.loading({ title: "Uploading files…" })}>Loading</button>
        </div>
        <Portal>
          <div {...api().getGroupProps()}>
            <Key each={api().getToasts()} by={(actor) => actor.id}>
              {(actor, index) => <ToastItem actor={actor} index={index} parent={service} />}
            </Key>
          </div>
        </Portal>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
