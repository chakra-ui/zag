import styles from "../../../../shared/src/css/file-upload.module.css"
import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(fileUpload.machine, { id: useId() })
  const api = fileUpload.connect(service, normalizeProps)

  return (
    <main className="file-upload">
      <div {...api.getRootProps()}>
        <div {...api.getDropzoneProps({ disableClick: true })} className={styles.Dropzone} data-cover="">
          {api.dragging && <p>Drop any files here to upload</p>}
        </div>
        <div style={{ position: "relative" }}>
          <input {...api.getHiddenInputProps()} />
          <button {...api.getTriggerProps()}>Choose Files...</button>

          <button>Normal Button</button>

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
      </div>
    </main>
  )
}
