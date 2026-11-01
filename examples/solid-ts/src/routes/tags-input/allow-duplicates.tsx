import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tags-input.css"

// Duplicate tags allowed via allowDuplicates.
export default function Page() {
  const service = useMachine(tagsInput.machine, {
    id: createUniqueId(),
    defaultValue: ["React", "Vue"],
    allowDuplicates: true,
  })

  const api = createMemo(() => tagsInput.connect(service, normalizeProps))

  return (
    <>
      <main class="tags-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Add tags (duplicates allowed):</label>
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
            <input placeholder="Try adding React or Vue again..." {...api().getInputProps()} />
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
