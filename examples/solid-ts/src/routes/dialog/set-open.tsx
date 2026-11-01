import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const [log, setLog] = createSignal<boolean[]>([])

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    onOpenChange(details) {
      setLog((prev) => [...prev, details.open])
    },
  })

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <div data-testid="open-state">{String(api().open)}</div>
      <div data-testid="open-change-log">{log().join(",")}</div>

      <button data-testid="reset" onClick={() => setLog([])}>
        Reset log
      </button>

      <button data-testid="set-open" onClick={() => api().setOpen(true)}>
        setOpen(true)
      </button>

      <button data-testid="set-closed" onClick={() => api().setOpen(false)}>
        setOpen(false)
      </button>

      <button
        data-testid="open-then-close"
        onClick={() => {
          api().setOpen(true)
          api().setOpen(false)
        }}
      >
        setOpen(true) then setOpen(false)
      </button>

      <button
        data-testid="close-then-open"
        onClick={() => {
          api().setOpen(false)
          api().setOpen(true)
        }}
      >
        setOpen(false) then setOpen(true)
      </button>

      <button
        data-testid="open-repeatedly"
        onClick={() => {
          for (let i = 0; i < 5; i++) api().setOpen(true)
        }}
      >
        setOpen(true) five times
      </button>

      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Imperative control</h2>
              <p {...api().getDescriptionProps()}>Opened and closed through api.setOpen.</p>
              <button data-testid="content-set-closed" onClick={() => api().setOpen(false)}>
                setOpen(false)
              </button>
              <button {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
