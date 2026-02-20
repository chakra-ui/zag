import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HiX } from "react-icons/hi"
import styles from "../styles/machines/file-upload.module.css"

interface FileUploadProps extends Omit<fileUpload.Props, "id"> {}

export function FileUpload(props: FileUploadProps) {
  const service = useMachine(fileUpload.machine, {
    id: useId(),
    ...props,
  })

  const api = fileUpload.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Dropzone} {...api.getDropzoneProps()}>
        <input {...api.getHiddenInputProps()} />
        <span>Drag your files here</span>
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          Open Dialog
        </button>
      </div>

      <div className={styles.ItemGroup}>
        {api.acceptedFiles.map((file, index) => (
          <div
            className={styles.Item}
            {...api.getItemProps({ file })}
            key={`${file.name}-${index}`}
          >
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
