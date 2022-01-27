import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as TagsInput from "@ui-machines/tags-input"
import { tagsInputControls } from "../../../shared/controls"
import { tagsInputStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

export default function Page() {
  const controls = useControls(tagsInputControls)

  const [state, send] = useMachine(
    TagsInput.machine.withContext({
      value: ["React", "Vue"],
    }),
    {
      context: controls.context,
    },
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { inputProps, rootProps, getTagProps, getTagDeleteButtonProps, getTagInputProps } = TagsInput.connect(
    state,
    send,
  )

  return (
    <>
      <Global styles={tagsInputStyle} />
      <controls.ui />

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
            <input className="tag-input" data-testid={`${toDashCase(value)}-input`} {...getTagInputProps({ index })} />
          </span>
        ))}
        <input className="tag-input" data-testid="input" placeholder="Add tag..." {...inputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
