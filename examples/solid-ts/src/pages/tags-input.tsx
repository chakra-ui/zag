import { injectGlobal } from "@emotion/css"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as TagsInput from "@ui-machines/tags-input"
import { createMemo, createUniqueId } from "solid-js"
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
      <div ref={ref} {...tagsInput().rootProps} className="tags-input">
        {state.context.value.map((value, index) => (
          <span>
            <div className="tag" {...tagsInput().getTagProps({ index, value })}>
              <span>{value} </span>
              <button className="tag-close" {...tagsInput().getTagDeleteButtonProps({ index, value })}>
                &#x2715;
              </button>
            </div>
            <input style={{ width: 40 }} {...tagsInput().getTagInputProps({ index })} />
          </span>
        ))}
        <input placeholder="Add tag..." {...tagsInput().inputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
