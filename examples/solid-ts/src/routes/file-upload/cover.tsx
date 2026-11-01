import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index, Show } from "solid-js"
import "@styles/file-upload.css"

export default function Page() {
  const service = useMachine(fileUpload.machine, { id: createUniqueId() })
  const api = createMemo(() => fileUpload.connect(service, normalizeProps))

  return (
    <main class="file-upload">
      <div {...api().getRootProps()}>
        <div {...api().getDropzoneProps({ disableClick: true })} data-cover="">
          <Show when={api().dragging}>
            <p>Drop any files here to upload</p>
          </Show>
        </div>
        <div style={{ position: "relative" }}>
          <input {...api().getHiddenInputProps()} />
          <button {...api().getTriggerProps()}>Choose Files...</button>

          <button>Normal Button</button>

          <ul {...api().getItemGroupProps()}>
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
        </div>
      </div>
    </main>
  )
}
