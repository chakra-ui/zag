import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@zag-js/react"
import * as TagsInput from "@zag-js/tags-input"
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
      value: ["React", "Vue", "Svelte", "Solid"],
    }),
    {
      context: controls.context,
    },
  )

  const ref = useSetup({ send, id: "1" })

  const api = TagsInput.connect(state, send)

  return (
    <>
      <Global styles={tagsInputStyle} />
      <controls.ui />

      <div ref={ref} {...api.rootProps}>
        <label {...api.labelProps}>Enter frameworks:</label>
        <div data-testid="control" {...api.controlProps}>
          {api.value.map((value, index) => (
            <span key={`${toDashCase(value)}-tag-${index}`}>
              <div data-testid={`${toDashCase(value)}-tag`} {...api.getTagProps({ index, value })}>
                <span data-testid={`${toDashCase(value)}-valuetext`}>{value} </span>
                <button
                  data-testid={`${toDashCase(value)}-close-button`}
                  {...api.getTagDeleteButtonProps({ index, value })}
                >
                  &#x2715;
                </button>
              </div>
              <input data-testid={`${toDashCase(value)}-input`} {...api.getTagInputProps({ index, value })} />
            </span>
          ))}
          <input data-testid="input" placeholder="add tag" {...api.inputProps} />
        </div>
        <input {...api.hiddenInputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
