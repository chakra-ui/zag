import { injectGlobal } from "@emotion/css"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as TagsInput from "@ui-machines/tags-input"
import { createMemo, createUniqueId, For } from "solid-js"
import { tagsInputControls } from "../../../../shared/controls"
import { tagsInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(tagsInputStyle)

export default function Page() {
  const controls = useControls(tagsInputControls)

  const [state, send] = useMachine(
    TagsInput.machine.withContext({
      value: ["React", "Vue"],
    }),
    { context: controls.context },
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const tagsInput = createMemo(() => TagsInput.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div ref={ref} {...tagsInput().rootProps} className="tags-input">
        <For each={tagsInput().value}>
          {(value, index) => (
            <span>
              <div className="tag" {...tagsInput().getTagProps({ index: index(), value })}>
                <span>{value} </span>
                <button className="tag-close" {...tagsInput().getTagDeleteButtonProps({ index: index(), value })}>
                  &#x2715;
                </button>
              </div>
              <input className="tag-input" {...tagsInput().getTagInputProps({ index: index() })} />
            </span>
          )}
        </For>
        <input className="tag-input" placeholder="Add tag..." {...tagsInput().inputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
