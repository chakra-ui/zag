import { useSearchParams } from "@solidjs/router"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/dialog.css"

export default function Page() {
  const [searchParams, setSearchParams] = useSearchParams<{ "show-dialog"?: string }>()

  const showDialog = () => searchParams["show-dialog"] === "true"

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    get open() {
      return showDialog()
    },
    onOpenChange(details) {
      setSearchParams({ "show-dialog": String(details.open) })
    },
  })

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Dialog Search Params</h1>
      <h1>{String(showDialog())}</h1>

      <button onClick={() => setSearchParams({ "show-dialog": "true" })}>Open</button>
      <button onClick={() => setSearchParams({ "show-dialog": "false" })}>Close</button>

      <button {...api().getTriggerProps()}>Open Dialog</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Edit profile</h2>
              <p {...api().getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
