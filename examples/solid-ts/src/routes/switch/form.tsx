import { normalizeProps, useMachine } from "@zag-js/solid"
import * as zagSwitch from "@zag-js/switch"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/switch.css"

export default function Page() {
  const [output, setOutput] = createSignal<string | null>(null)

  const service = useMachine(zagSwitch.machine, {
    id: createUniqueId(),
    name: "newsletter",
    value: "yes",
    required: true,
  })

  const api = createMemo(() => zagSwitch.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="switch-form">
          <p class="hint">Turn it on and subscribe to see what the form sends, then reset.</p>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              const params = new URLSearchParams(new FormData(e.currentTarget) as unknown as Record<string, string>)
              setOutput(params.toString() || "(no fields sent)")
            }}
            onReset={() => setOutput(null)}
          >
            <label data-testid="switch-newsletter" {...api().getRootProps()}>
              <input {...api().getHiddenInputProps()} />
              <span {...api().getControlProps()}>
                <span {...api().getThumbProps()} />
              </span>
              <span {...api().getLabelProps()}>Weekly newsletter</span>
            </label>
            <div class="actions">
              <button type="submit">Subscribe</button>
              <button type="reset">Reset</button>
            </div>
          </form>
          <Show when={output()}>
            <pre class="output" data-testid="form-output">
              {output()}
            </pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
