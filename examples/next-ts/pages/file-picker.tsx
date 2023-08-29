import * as filePicker from "@zag-js/file-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { filePickerControls, formatFileSize } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(filePickerControls)
  const [state, send] = useMachine(filePicker.machine({ id: useId() }), { context: controls.context })
  const api = filePicker.connect(state, send, normalizeProps)

  return (
    <>
      <main className="file-picker">
        <div {...api.rootProps}>
          <div {...api.dropzoneProps}>
            <input {...api.hiddenInputProps} />
            Drag your files here
          </div>

          <button {...api.triggerProps}>Choose Files...</button>

          <ul>
            {api.files.map((file) => {
              return (
                <li className="file" key={file.name}>
                  <div>
                    <b>{file.name}</b>
                  </div>
                  <div>{formatFileSize(file.size)}</div>
                  <div>{file.type}</div>
                  <button {...api.getDeleteTriggerProps({ file })}>X</button>
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
