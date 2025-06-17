import { normalizeProps, useMachine } from "@zag-js/react"
import * as tagsInput from "@zag-js/tags-input"
import { useId } from "react"

interface TagsInputProps extends Omit<tagsInput.Props, "id"> {}

export function TagsInput(props: TagsInputProps) {
  const service = useMachine(tagsInput.machine, {
    id: useId(),
    defaultValue: ["React", "Vue"],
    ...props,
  })

  const api = tagsInput.connect(service, normalizeProps)

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
