import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/toast.css"

const placements: toast.Placement[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]

const toasters = new Map(placements.map((placement) => [placement, toast.createStore({ placement })]))

function Toaster(props: { store: toast.Store }) {
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: props.store })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <Portal>
      <div {...api().getGroupProps()}>
        <Key each={api().getToasts()} by={(actor) => actor.id}>
          {(actor, index) => <ToastItem actor={actor} index={index} parent={service} />}
        </Key>
      </div>
    </Portal>
  )
}

export default function Page() {
  return (
    <main>
      <div class="hstack">
        <For each={placements}>
          {(placement) => (
            <button onClick={() => toasters.get(placement)!.create({ title: `Toast at ${placement}` })}>
              {placement}
            </button>
          )}
        </For>
      </div>
      <For each={placements}>{(placement) => <Toaster store={toasters.get(placement)!} />}</For>
    </main>
  )
}
