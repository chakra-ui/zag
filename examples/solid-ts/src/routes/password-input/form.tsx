import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { EyeIcon, EyeOffIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/password-input.css"

export default function Page() {
  const [output, setOutput] = createSignal("")

  const service = useMachine(passwordInput.machine, {
    id: createUniqueId(),
    name: "password",
    required: true,
    autoComplete: "new-password",
  })

  const api = createMemo(() => passwordInput.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="password-form">
          <p class="hint">Submit empty to see the required check, then save a password.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const data = Object.fromEntries(new FormData(e.currentTarget))
              // never print a real password, even in a demo
              const masked = { ...data, password: `•••• (${String(data.password).length} characters)` }
              setOutput(JSON.stringify(masked, null, 2))
            }}
            onReset={() => setOutput("")}
          >
            <div {...api().getRootProps()}>
              <label {...api().getLabelProps()}>Password</label>
              <div {...api().getControlProps()}>
                <input {...api().getInputProps()} />
                <button {...api().getVisibilityTriggerProps()}>
                  <span {...api().getIndicatorProps()}>
                    <Show when={api().visible} fallback={<EyeOffIcon />}>
                      <EyeIcon />
                    </Show>
                  </span>
                </button>
              </div>
            </div>
            <div class="actions">
              <button type="submit">Save password</button>
              <button type="reset">Reset</button>
            </div>
          </form>
          <Show when={output()}>
            <pre class="output">{output()}</pre>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
