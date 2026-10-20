import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import * as toast from "@zag-js/toast"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { ToastItem } from "~/components/toast-item"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end" })

function upload(options: { reject?: boolean; description?: string } = {}) {
  const request = new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (options.reject) reject(new Error("The upload failed. Try again."))
      else resolve("photo.png")
    }, 1200)
  })

  const result = toaster.promise(request, {
    loading: { title: "Uploading photo…", description: "Please wait." },
    success: (name) => ({ title: "Upload complete", description: `${name} is ready.` }),
    error: (error) => ({ title: "Upload failed", description: (error as Error).message }),
  })

  if (options.description !== undefined && result?.id) {
    toaster.create({ id: result.id, description: options.description })
  }
}

export default function Page() {
  const service = useMachine(toast.group.machine, { id: createUniqueId(), store: toaster })
  const api = createMemo(() => toast.group.connect(service, normalizeProps))

  return (
    <main>
      <div class="hstack">
        <button onClick={() => upload()}>Upload</button>
        <button onClick={() => upload({ description: "Sending photo.png…" })}>Upload with message</button>
        <button onClick={() => upload({ reject: true })}>Fail upload</button>
      </div>
      <Portal>
        <div {...api().getGroupProps()}>
          <Key each={api().getToasts()} by={(actor) => actor.id}>
            {(actor, index) => <ToastItem actor={actor} index={index} parent={service} />}
          </Key>
        </div>
      </Portal>
    </main>
  )
}
