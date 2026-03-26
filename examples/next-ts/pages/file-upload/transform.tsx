import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { compressAccurately } from "image-conversion"
import { useId } from "react"

export default function Page() {
  const service = useMachine(fileUpload.machine, {
    id: useId(),
    accept: ["image/jpeg", "image/png"],
    transformFiles: async (files) => {
      return Promise.all(
        files.map(async (file) => {
          const blob = await compressAccurately(file, 200)
          return new File([blob], file.name, { type: blob.type })
        }),
      )
    },
  })

  const api = fileUpload.connect(service, normalizeProps)

  return (
    <main className="file-upload">
      <div {...api.getRootProps()}>
        <input data-testid="input" {...api.getHiddenInputProps()} />
        <div {...api.getDropzoneProps()}>Drag your files here</div>

        <button {...api.getTriggerProps()}>Choose Files...</button>

        <ul {...api.getItemGroupProps()}>
          {api.acceptedFiles.map((file) => {
            return (
              <li className="file" key={file.name} {...api.getItemProps({ file })}>
                <div>
                  <b>{file.name}</b>
                </div>
                <div {...api.getItemSizeTextProps({ file })}>{api.getFileSize(file)}</div>
                <div>{file.type}</div>
                <button {...api.getItemDeleteTriggerProps({ file })}>X</button>
              </li>
            )
          })}
        </ul>
      </div>
    </main>
  )
}
