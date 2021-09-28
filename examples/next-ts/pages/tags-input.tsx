import { tagsInput } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import * as styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { tagsInputStyle } from "../../../shared/style"

const Styles = styled.default(`div`)(tagsInputStyle as styled.CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    tagsInput.machine.withContext({
      uid: "123",
      value: ["React", "Vue"],
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputProps, rootProps, getTagProps, getTagDeleteButtonProps, getTagInputProps } = tagsInput.connect(
    state,
    send,
  )

  return (
    <Styles>
      <div ref={ref} {...rootProps} className="tags-input">
        {state.context.value.map((value, index) => (
          <span key={index}>
            <div className="tag" {...getTagProps({ index, value })}>
              <span>{value} </span>
              <button className="tag-close" {...getTagDeleteButtonProps({ index, value })}>
                &#x2715;
              </button>
            </div>
            <input style={{ width: 40 }} {...getTagInputProps({ index })} />
          </span>
        ))}
        <input placeholder="Add tag..." {...inputProps} />
      </div>

      <StateVisualizer state={state} />
    </Styles>
  )
}
