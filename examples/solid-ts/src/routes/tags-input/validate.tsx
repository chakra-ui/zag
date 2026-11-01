import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId, Index, createSignal, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tags-input.css"

// Only lowercase alphabetic tags; duplicates prevented by default.
export default function Page() {
  const [invalidReason, setInvalidReason] = createSignal<string | null>(null)

  const service = useMachine(tagsInput.machine, {
    id: createUniqueId(),
    defaultValue: ["react", "vue"],
    validate(details) {
      return /^[a-z]+$/.test(details.inputValue)
    },
    onValueChange() {
      setInvalidReason(null)
    },
    onValueInvalid(details) {
      setInvalidReason(details.reason)
    },
  })

  const api = createMemo(() => tagsInput.connect(service, normalizeProps))

  return (
    <>
      <main class="tags-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Lowercase letters only:</label>
          <div {...api().getControlProps()}>
            <Index each={api().value}>
              {(value, index) => (
                <span {...api().getItemProps({ index, value: value() })}>
                  <div {...api().getItemPreviewProps({ index, value: value() })}>
                    <span {...api().getItemTextProps({ index, value: value() })}>{value()} </span>
                    <button {...api().getItemDeleteTriggerProps({ index, value: value() })}>
                      <XIcon />
                    </button>
                  </div>
                  <input {...api().getItemInputProps({ index, value: value() })} />
                </span>
              )}
            </Index>
            <input placeholder="Try: svelte or React (rejected)" {...api().getInputProps()} />
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
          <Show when={invalidReason()}>
            <p style={{ "margin-top": "8px", "font-size": "14px", color: "red" }}>Invalid: {invalidReason()}</p>
          </Show>
          <input {...api().getHiddenInputProps()} />
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
