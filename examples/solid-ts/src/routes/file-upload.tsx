import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(fileUploadControls)

  const service = useMachine(fileUpload.machine, { id: createUniqueId() })

  const api = createMemo(() => fileUpload.connect(service, normalizeProps))

  return (
    <>
      <main class="file-upload">
        <div {...api().getRootProps()}>
          <div {...api().getDropzoneProps()}>
            <input {...api().getHiddenInputProps()} />
            Drag your files here
          </div>

          <button {...api().getTriggerProps()}>Choose Files...</button>

          <ul>
            <Index each={api().acceptedFiles}>
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

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
