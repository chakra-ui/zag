import styled from "@emotion/styled"
import { useMachine } from "@ui-machines/react"
import * as TagsInput from "@ui-machines/tags-input"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"
import { tagsInputStyle } from "../../../shared/style"

const Styles = styled.div(tagsInputStyle)

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls({
    autoFocus: { type: "boolean", defaultValue: false },
    addOnPaste: { type: "boolean", defaultValue: false },
    addOnBlur: { type: "boolean", defaultValue: false },
    max: { type: "number", defaultValue: 4 },
    allowOutOfRange: { type: "boolean", defaultValue: false },
  })

  const [state, send] = useMachine(
    TagsInput.machine.withContext({
      uid: "123",
      value: ["React", "Vue"],
    }),
    {
      context: controls.context,
    },
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputProps, rootProps, getTagProps, getTagDeleteButtonProps, getTagInputProps } = TagsInput.connect(
    state,
    send,
  )

  return (
    <>
      <controls.ui />
      <Styles>
        <div ref={ref} {...rootProps} className="tags-input">
          {state.context.value.map((value, index) => (
            <span key={index}>
              <div className="tag" data-testid={`${toDashCase(value)}-tag`} {...getTagProps({ index, value })}>
                <span data-testid={`${toDashCase(value)}-valuetext`}>{value} </span>
                <button
                  className="tag-close"
                  data-testid={`${toDashCase(value)}-close-button`}
                  {...getTagDeleteButtonProps({ index, value })}
                >
                  &#x2715;
                </button>
              </div>
              <input
                data-testid={`${toDashCase(value)}-input`}
                style={{ width: 40 }}
                {...getTagInputProps({ index })}
              />
            </span>
          ))}
          <input data-testid="input" placeholder="Add tag..." {...inputProps} />
        </div>

        <StateVisualizer state={state} />
      </Styles>
    </>
  )
}
