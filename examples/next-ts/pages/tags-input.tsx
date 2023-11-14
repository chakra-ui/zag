import { normalizeProps, useMachine } from "@zag-js/react"
import { tagsInputControls } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { useId } from "react"
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
      id: useId(),
      value: ["React", "Vue"],
    }),
    {
      context: controls.context,
    },
  )

  const api = tagsInput.connect(state, send, normalizeProps)

  return (
    <>
      <main className="tags-input">
        <div {...api.rootProps}>
          <label {...api.labelProps}>Enter frameworks:</label>
          <div {...api.controlProps}>
            {api.value.map((value, index) => (
              <span key={`${toDashCase(value)}-tag-${index}`}>
                <div data-testid={`${toDashCase(value)}-tag`} {...api.getItemProps({ index, value })}>
                  <span data-testid={`${toDashCase(value)}-valuetext`} {...api.getItemTextProps({ index, value })}>
                    {value}{" "}
                  </span>
                  <button
                    data-testid={`${toDashCase(value)}-close-button`}
                    {...api.getItemDeleteTriggerProps({ index, value })}
                  >
                    &#x2715;
                  </button>
                </div>
                <input data-testid={`${toDashCase(value)}-input`} {...api.getItemInputProps({ index, value })} />
              </span>
            ))}
            <input data-testid="input" placeholder="add tag" {...api.inputProps} />
          </div>
          <input {...api.hiddenInputProps} />
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
