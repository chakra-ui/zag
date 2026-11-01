import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", max: 2, duration: Infinity })

function updateWaiting() {
  for (let i = 0; i < 2; i++) {
    toaster.update("waiting", (prev) => {
      const updates = (prev.meta?.updates ?? 0) + 1
      return { title: `Toast 3 (updated ${updates} times)`, meta: { updates } }
    })
  }
}

function dismissOldest() {
  const oldest = toaster.getVisibleToasts().at(-1)
  if (oldest?.id) toaster.dismiss(oldest.id)
}

export default function Page() {
  const [started, setStarted] = createSignal(false)
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  function start() {
    toaster.create({ id: "first", title: "Toast 1" })
    toaster.create({ id: "second", title: "Toast 2" })
    toaster.create({ id: "waiting", title: "Toast 3", description: "Waited for a free slot.", meta: { updates: 0 } })
    setStarted(true)
  }

  function reset() {
    toaster.remove()
    setStarted(false)
  }

  return (
    <main>
      <div class="hstack">
        <button disabled={started()} onClick={start}>
          Create three toasts
        </button>
        <button disabled={!started()} onClick={updateWaiting}>
          Update waiting toast
        </button>
        <button disabled={!started()} onClick={() => toaster.dismiss("waiting")}>
          Dismiss waiting toast
        </button>
        <button disabled={!started()} onClick={dismissOldest}>
          Dismiss oldest
        </button>
        <button onClick={reset}>Reset</button>
      </div>
      <Portal>
        <div {...api().getGroupProps()}>
          <Key each={api().getToasts()} by={(actor) => actor.id}>
            {(actor, index) => <ToastItem actor={actor} index={index} parent={service} />}
          </Key>
        </div>
      </Portal>
    </main>
  )
}
