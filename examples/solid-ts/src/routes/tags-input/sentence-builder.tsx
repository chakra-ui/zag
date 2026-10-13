import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tags-input.css"

// Sentence builder: repeatable tokens split by comma/space.
export default function Page() {
  const service = useMachine(tagsInput.machine, {
    id: createUniqueId(),
    defaultValue: ["Hello", ",", " ", "world", "!"],
    allowDuplicates: true,
    delimiter: /[,\s]+/,
    addOnPaste: true,
    editable: true,
  })

  const api = createMemo(() => tagsInput.connect(service, normalizeProps))

  return (
    <>
      <main class="tags-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Sentence builder (tokens can repeat):</label>
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
            <input
              placeholder='Add tokens: type "Hello" or paste "a, b, a" (comma/space splits)'
              {...api().getInputProps()}
            />
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
          <input {...api().getHiddenInputProps()} />
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
