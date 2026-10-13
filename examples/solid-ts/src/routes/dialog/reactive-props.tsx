import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createSignal, createUniqueId, onCleanup } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/dialog.css"

// A remount resets this to 0, so a steady count proves the dialog was never torn down.
function Uptime() {
  const [ticks, setTicks] = createSignal(0)
  const id = setInterval(() => setTicks((n) => n + 1), 100)
  onCleanup(() => clearInterval(id))

  return (
    <p data-testid="uptime">
      content uptime: <b data-testid="ticks">{ticks()}</b> ticks
    </p>
  )
}

export default function Page() {
  const [modal, setModal] = createSignal(false)
  const [trapFocus, setTrapFocus] = createSignal(true)
  const [preventScroll, setPreventScroll] = createSignal(true)

  const id = createUniqueId()
  const service = useMachine(dialog.machine, () => ({
    id,
    defaultOpen: true,
    modal: modal(),
    trapFocus: trapFocus(),
    preventScroll: preventScroll(),
  }))

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  const minimized = () => !trapFocus() && !preventScroll()
  const toggleMinimized = () => {
    const next = minimized()
    setTrapFocus(next)
    setPreventScroll(next)
  }

  return (
    <main class="dialog">
      <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
        <button data-testid="toggle-minimized" onClick={toggleMinimized}>
          {minimized() ? "Maximize" : "Minimize"}
        </button>
        <button data-testid="toggle-trap" onClick={() => setTrapFocus((v) => !v)}>
          trapFocus: {String(trapFocus())}
        </button>
        <button data-testid="toggle-scroll" onClick={() => setPreventScroll((v) => !v)}>
          preventScroll: {String(preventScroll())}
        </button>
        <button data-testid="toggle-modal" onClick={() => setModal((v) => !v)}>
          modal: {String(modal())}
        </button>
        <button {...api().getTriggerProps()} data-testid="trigger">
          Open dialog
        </button>
      </div>

      <button data-testid="outside-button" style={{ "margin-top": "16px" }}>
        Outside button (should be reachable by Tab only when trapFocus is off)
      </button>

      <div style={{ height: "150vh", "padding-top": "16px" }}>Long page, so body scroll lock is observable.</div>

      <Show when={api().open}>
        <Portal>
          {/* kept mounted so DOM order stays backdrop → positioner */}
          <div {...api().getBackdropProps()} style={{ display: modal() ? undefined : "none" }} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()} data-testid="content">
              <h2 {...api().getTitleProps()}>Player</h2>
              <p {...api().getDescriptionProps()}>
                Minimizing releases focus and scroll without closing or remounting.
              </p>
              <Uptime />
              <input data-testid="inside-input" placeholder="Inside the dialog..." />
              <button data-testid="inside-toggle-minimized" onClick={toggleMinimized}>
                {minimized() ? "Maximize" : "Minimize"}
              </button>
              <button {...api().getCloseTriggerProps()} data-testid="close">
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
