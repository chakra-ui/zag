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

const toaster = toast.createStore({ placement: "bottom-end", overlap: true })

const messages = [
  { title: "Message sent", description: "Your message to Ada was delivered." },
  { title: "File uploaded" },
  { title: "Invite accepted", description: "Grace joined the design team and can now edit shared files." },
]

let count = 0

export default function Page() {
  const controls = useControls(toastControls)
  const service = useMachine(toast.group.machine, controls.mergeProps({ id: createUniqueId(), store: toaster }))
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <>
      <main>
        <button onClick={() => toaster.create(messages[count++ % messages.length])}>Show toast</button>
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
