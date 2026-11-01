import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/file-upload.css"

export default function Page() {
  const controls = useControls(fileUploadControls)

  const service = useMachine(fileUpload.machine, {
    id: createUniqueId(),
    maxFiles: 2,
  })

  const api = createMemo(() => fileUpload.connect(service, normalizeProps))

  return (
    <>
      <main class="file-upload">
        <div {...api().getRootProps()}>
          <input data-testid="input" {...api().getHiddenInputProps()} />
          <div {...api().getDropzoneProps()}>Drag your files here</div>

          <button {...api().getTriggerProps()}>Choose Files...</button>

          <ul {...api().getItemGroupProps()}>
            <li>Accepted files</li>
            <Index each={api().acceptedFiles}>
              {(file) => (
                <li class="file" {...api().getItemProps({ file: file() })}>
                  <div>
                    <b>{file().name}</b>
                  </div>
                  <div {...api().getItemSizeTextProps({ file: file() })}>{api().getFileSize(file())}</div>
                  <div>{file().type}</div>
                  <button {...api().getItemDeleteTriggerProps({ file: file() })}>X</button>
                </li>
              )}
            </Index>
          </ul>

          <ul {...api().getItemGroupProps({ type: "rejected" })}>
            <li>Rejected files</li>
            <Index each={api().rejectedFiles}>
              {(item) => (
                <li class="file" {...api().getItemProps({ file: item().file, type: "rejected" })}>
                  <div>
                    <b>{item().file.name}</b>
                    <Index each={item().errors}>{(error) => <span>{error()}</span>}</Index>
                  </div>
                  <div {...api().getItemSizeTextProps({ file: item().file, type: "rejected" })}>
                    {api().getFileSize(item().file)}
                  </div>
                  <div>{item().file.type}</div>
                  <button {...api().getItemDeleteTriggerProps({ file: item().file, type: "rejected" })}>X</button>
                </li>
              )}
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
