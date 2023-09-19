import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tagsInput from "@zag-js/tags-input"
import { createMemo, createUniqueId, For } from "solid-js"
import { tagsInputControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const [state, send] = useMachine(
    tagsInput.machine({
      id: createUniqueId(),
      value: ["React", "Vue"],
    }),
    { context: controls.context },
  )

  const api = createMemo(() => tagsInput.connect(state, send, normalizeProps))

  return (
    <>
      <main class="tags-input">
        <div {...api().rootProps}>
          <label {...api().labelProps}>Enter frameworks:</label>
          <div {...api().controlProps}>
            <For each={api().value}>
              {(value, index) => (
                <span>
                  <div data-testid={`${toDashCase(value)}-tag`} {...api().getItemProps({ index: index(), value })}>
                    <span data-testid={`${toDashCase(value)}-valuetext`}>{value} </span>
                    <button
                      data-testid={`${toDashCase(value)}-close-button`}
                      {...api().getItemDeleteTriggerProps({ index: index(), value })}
                    >
                      &#x2715;
                    </button>
                  </div>
                  <input
                    data-testid={`${toDashCase(value)}-input`}
                    {...api().getItemInputProps({ index: index(), value })}
                  />
                </span>
              )}
            </For>
            <input data-testid="input" placeholder="add tag" {...api().inputProps} />
          </div>
          <input {...api().hiddenInputProps} />
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
