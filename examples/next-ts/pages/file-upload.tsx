import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/react"
import { fileUploadControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(fileUploadControls)
  const [state, send] = useMachine(fileUpload.machine({ id: useId() }), { context: controls.context })
  const api = fileUpload.connect(state, send, normalizeProps)

  return (
    <>
      <main className="file-upload">
        <div {...api.rootProps}>
          <div {...api.dropzoneProps}>
            <input {...api.hiddenInputProps} />
            Drag your files here
          </div>

          <button {...api.triggerProps}>Choose Files...</button>

          <ul {...api.itemGroupProps}>
            {api.files.map((file) => {
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

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
