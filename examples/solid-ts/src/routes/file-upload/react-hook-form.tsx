import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, Index } from "solid-js"
import "@styles/file-upload.css"

// Plain form handling: validate on submit, then re-validate as files change
export default function Page() {
  const service = useMachine(fileUpload.machine, { id: createUniqueId() })
  const api = createMemo(() => fileUpload.connect(service, normalizeProps))

  const [submitted, setSubmitted] = createSignal(false)
  const error = createMemo(() => (submitted() && !api().acceptedFiles.length ? "This is required" : undefined))

  return (
    <main>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
          if (error()) return
          console.log({ file: api().acceptedFiles })
        }}
        style={{ width: "100%" }}
      >
        <div {...api().getRootProps()}>
          <input {...api().getHiddenInputProps()} name="file" />
          <div {...api().getDropzoneProps()}>
            <span>Drag your files here</span>
            <button {...api().getTriggerProps()}>Open Dialog</button>
          </div>

          <div>
            <Index each={api().acceptedFiles}>
              {(file) => (
                <div {...api().getItemProps({ file: file() })}>
                  <div>
                    {file().name} {api().getFileSize(file())}
                  </div>
                  <button {...api().getItemDeleteTriggerProps({ file: file() })}>
                    <XIcon />
                  </button>
                </div>
              )}
            </Index>
          </div>

          <button type="submit">Submit</button>

          {error()}
        </div>
      </form>
    </main>
  )
}
