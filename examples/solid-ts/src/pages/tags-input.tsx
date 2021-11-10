import { tagsInput } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo } from "solid-js"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { tagsInputStyle } from "../../../../shared/style"

const styles = css(tagsInputStyle as CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    tagsInput.machine.withContext({
      uid: "123",
      value: ["React", "Vue"],
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const machineState = createMemo(() => tagsInput.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <div ref={ref} {...machineState().rootProps} className="tags-input">
        {state.context.value.map((value, index) => (
          <span>
            <div className="tag" {...machineState().getTagProps({ index, value })}>
              <span>{value} </span>
              <button className="tag-close" {...machineState().getTagDeleteButtonProps({ index, value })}>
                &#x2715;
              </button>
            </div>
            <input style={{ width: 40 }} {...machineState().getTagInputProps({ index })} />
          </span>
        ))}
        <input placeholder="Add tag..." {...machineState().inputProps} />
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
