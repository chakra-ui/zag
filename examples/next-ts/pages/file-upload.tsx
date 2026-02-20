import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { fileUploadControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(fileUploadControls)

  const service = useMachine(fileUpload.machine, { id: useId(), ...controls.context })

  const api = fileUpload.connect(service, normalizeProps)

  return (
    <>
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

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
