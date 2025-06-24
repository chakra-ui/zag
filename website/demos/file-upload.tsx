import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiX } from "react-icons/hi"

interface FileUploadProps extends Omit<fileUpload.Props, "id"> {}

export function FileUpload(props: FileUploadProps) {
  const service = useMachine(fileUpload.machine, {
    id: useId(),
    ...props,
  })

  const api = fileUpload.connect(service, normalizeProps)

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
