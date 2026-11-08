import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/clipboard.css"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const generateKey = () =>
  "zag_live_" + Array.from({ length: 24 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")

export default function Page() {
  const [value, setValue] = createSignal("zag_live_51Hx8Kq2eZvKGdY4Tn9PzLm3W")
  const [status, setStatus] = createSignal("")

  const id = createUniqueId()
  const service = useMachine(clipboard.machine, () => ({
    id,
    value: value(),
    onStatusChange: (details) => setStatus(details.copied ? "Copied!" : ""),
  }))

  const api = createMemo(() => clipboard.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="api-key">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Secret API key</label>
            <div {...api().getControlProps()}>
              <input {...api().getInputProps()} style={{ width: "100%" }} />
              <button {...api().getTriggerProps()}>
                <Show when={api().copied} fallback={<ClipboardCopyIcon />}>
                  <ClipboardCheck />
                </Show>
              </button>
            </div>
            <div class="actions">
              <button
                type="button"
                onClick={() => {
                  setValue(generateKey())
                  setStatus("")
                }}
              >
                Regenerate
              </button>
              <span data-testid="status">{status()}</span>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
