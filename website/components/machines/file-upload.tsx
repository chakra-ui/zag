import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiX } from "react-icons/hi"

export function FileUpload(props: { controls: any }) {
  const [state, send] = useMachine(fileUpload.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = fileUpload.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getDropzoneProps()}>
        <input {...api.getHiddenInputProps()} />
        <span>Drag your files here</span>
        <button {...api.getTriggerProps()}>Open Dialog</button>
      </div>

      <div>
        {api.acceptedFiles.map((file) => (
          <div {...api.getItemProps({ file })} key={file.name}>
            <div>
              {file.name} {api.getFileSize(file)}
            </div>
            <button {...api.getItemDeleteTriggerProps({ file })}>
              <HiX />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
