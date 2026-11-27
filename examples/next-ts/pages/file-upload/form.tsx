import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef, useState } from "react"

export default function Page() {
  const formRef = useRef<HTMLFormElement>(null)
  const [formFiles, setFormFiles] = useState<string[] | null>(null)

  const service = useMachine(fileUpload.machine, {
    id: useId(),
    name: "file",
    onFileAccept() {
      // Read the form the way an auto-submitting form would, from inside the callback
      const data = new FormData(formRef.current!)
      setFormFiles(data.getAll("file").map((value) => (value as File).name))
    },
  })

  const api = fileUpload.connect(service, normalizeProps)

  return (
    <main className="file-upload">
      <form ref={formRef}>
        <div {...api.getRootProps()}>
          <input data-testid="input" {...api.getHiddenInputProps()} />
          <div {...api.getDropzoneProps()}>Drag your files here</div>
          <button type="button" {...api.getTriggerProps()}>
            Choose Files...
          </button>
          <ul {...api.getItemGroupProps()}>
            {api.acceptedFiles.map((file) => (
              <li className="file" key={file.name} {...api.getItemProps({ file })}>
                <b>{file.name}</b>
                <button type="button" {...api.getItemDeleteTriggerProps({ file })}>
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
      <p>
        Files in the form when onFileAccept ran:{" "}
        <output data-testid="form-files">{formFiles === null ? "(not called)" : `[${formFiles.join(", ")}]`}</output>
      </p>
    </main>
  )
}
