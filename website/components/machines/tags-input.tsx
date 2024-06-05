import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function TagsInput(props: any) {
  const [state, send] = useMachine(
    tagsInput.machine({
      id: useId(),
      value: ["React", "Vue"],
    }),
    { context: props.controls },
  )

  const api = tagsInput.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Enter frameworks:</label>
      <div {...api.getControlProps()}>
        {api.value.map((value, index) => {
          const opt = { index, value }
          return (
            <span key={index} {...api.getItemProps(opt)}>
              <div {...api.getItemPreviewProps(opt)}>
                <span>{value}</span>
                <button {...api.getItemDeleteTriggerProps(opt)}>
                  &#x2715;
                </button>
              </div>
              <input {...api.getItemInputProps(opt)} />
            </span>
          )
        })}
        <input placeholder="Add tag..." {...api.getInputProps()} />
      </div>
    </div>
  )
}
