import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(fileUploadControls)

  const [state, send] = useMachine(fileUpload.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => fileUpload.connect(state, send, normalizeProps))

  return (
    <>
      <main class="file-upload">
        <div {...api().rootProps}>
          <div {...api().dropzoneProps}>
            <input {...api().hiddenInputProps} />
            Drag your files here
          </div>

          <button {...api().triggerProps}>Choose Files...</button>

          <ul>
            <Index each={api().files}>
              {(file) => {
                return (
                  <li class="file" {...api().getItemProps({ file: file() })}>
                    <div>
                      <b>{file().name}</b>
                    </div>
                    <div {...api().getItemSizeTextProps({ file: file() })}>{api().getFileSize(file())}</div>
                    <div>{file().type}</div>
                    <button {...api().getItemDeleteTriggerProps({ file: file() })}>X</button>
                  </li>
                )
              }}
            </Index>
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
