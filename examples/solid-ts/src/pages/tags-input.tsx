import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import * as TagsInput from "@zag-js/tags-input"
import { createMemo, createUniqueId, For } from "solid-js"
import { tagsInputControls } from "../../../../shared/controls"
import { tagsInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(tagsInputStyle)

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const [state, send] = useMachine(
    TagsInput.machine({
      value: ["React", "Vue"],
    }),
    { context: controls.context },
  )

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => TagsInput.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div ref={ref} {...api().rootProps}>
        <label {...api().labelProps}>Enter frameworks:</label>
        <div {...api().controlProps}>
          <For each={api().value}>
            {(value, index) => (
              <span>
                <div data-testid={`${toDashCase(value)}-tag`} {...api().getTagProps({ index: index(), value })}>
                  <span data-testid={`${toDashCase(value)}-valuetext`}>{value} </span>
                  <button
                    data-testid={`${toDashCase(value)}-close-button`}
                    {...api().getTagDeleteButtonProps({ index: index(), value })}
                  >
                    &#x2715;
                  </button>
                </div>
                <input
                  data-testid={`${toDashCase(value)}-input`}
                  {...api().getTagInputProps({ index: index(), value })}
                />
              </span>
            )}
          </For>
          <input data-testid="input" placeholder="add tag" {...api().inputProps} />
        </div>
        <input {...api().hiddenInputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
