import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { EyeIcon, EyeOffIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/password-input.css"

export default function Page() {
  const [value, setValue] = createSignal("")

  const rules = createMemo(() => [
    { id: "length", label: "At least 8 characters", met: value().length >= 8 },
    { id: "number", label: "Contains a number", met: /\d/.test(value()) },
  ])
  const invalid = createMemo(() => value().length > 0 && rules().some((rule) => !rule.met))

  const service = useMachine(passwordInput.machine, () => ({
    id: createUniqueId(),
    autoComplete: "new-password" as const,
    invalid: invalid(),
  }))

  const api = createMemo(() => passwordInput.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="password-sign-up">
          <p class="hint">Type a password to see which rules it still needs to meet.</p>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Password</label>
            <div {...api().getControlProps()}>
              <input {...api().getInputProps()} onInput={(e) => setValue(e.currentTarget.value)} />
              <button {...api().getVisibilityTriggerProps()}>
                <span {...api().getIndicatorProps()}>
                  <Show when={api().visible} fallback={<EyeOffIcon />}>
                    <EyeIcon />
                  </Show>
                </span>
              </button>
            </div>
          </div>
          <ul class="rules">
            <For each={rules()}>
              {(rule) => (
                <li data-testid={`rule-${rule.id}`} data-met={rule.met}>
                  {rule.label} ({rule.met ? "met" : "not met"})
                </li>
              )}
            </For>
          </ul>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
