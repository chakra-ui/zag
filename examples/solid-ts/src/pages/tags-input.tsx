import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as TagsInput from "@ui-machines/tags-input"
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
    TagsInput.machine.withContext({
      value: ["React", "Vue"],
    }),
    { context: controls.context },
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const api = createMemo(() => TagsInput.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div ref={ref} {...api().rootProps}>
        <label {...api().labelProps}>Enter frameworks:</label>
        <div className="tags-input">
          <For each={api().value}>
            {(value, index) => (
              <span>
                <div
                  className="tag"
                  data-testid={`${toDashCase(value)}-tag`}
                  {...api().getTagProps({ index: index(), value })}
                >
                  <span data-testid={`${toDashCase(value)}-valuetext`}>{value} </span>
                  <button
                    className="tag-close"
                    data-testid={`${toDashCase(value)}-close-button`}
                    {...api().getTagDeleteButtonProps({ index: index(), value })}
                  >
                    &#x2715;
                  </button>
                </div>
                <input
                  className="tag-input"
                  data-testid={`${toDashCase(value)}-input`}
                  {...api().getTagInputProps({ index: index(), value })}
                />
              </span>
            )}
          </For>
          <input className="tag-input" data-testid="input" placeholder="Add tag..." {...api().inputProps} />
        </div>
        <input {...api().hiddenInputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
