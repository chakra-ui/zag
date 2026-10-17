import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useId, useState } from "react"
import { ToastItem } from "../../components/toast-item"

export default function PromiseToasts() {
  const [toaster] = useState(() => toast.createStore({ placement: "bottom-end", overlap: false }))
  const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)

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

  return (
    <main style={{ display: "grid", alignContent: "start", gap: "24px", maxWidth: "640px" }}>
      <h1>Promise toasts</h1>
      <p>Show a loading toast while uploading, then update it with the result.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <button onClick={() => upload()}>Upload successfully</button>
        <button onClick={() => upload({ description: "Sending photo.png…" })}>Upload with progress message</button>
        <button onClick={() => upload({ reject: true })}>Fail upload</button>
        <button onClick={() => toaster.dismiss()}>Dismiss all</button>
      </div>
      <Portal>
        <div {...api.getGroupProps()}>
          {api.getToasts().map((actor, index) => (
            <ToastItem key={actor.id} actor={actor} index={index} parent={service} />
          ))}
        </div>
      </Portal>
    </main>
  )
}
