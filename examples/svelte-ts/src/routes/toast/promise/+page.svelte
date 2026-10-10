<script lang="ts">
  import ToastItem from "$lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"

  const toaster = toast.createStore({ placement: "bottom-end", overlap: false })
  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))

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
</script>

<main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
  <h1>Promise toasts</h1>
  <p>Show a loading toast while uploading, then update it with the result.</p>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <button onclick={() => upload()}>Upload successfully</button>
    <button onclick={() => upload({ description: "Sending photo.png…" })}>Upload with progress message</button>
    <button onclick={() => upload({ reject: true })}>Fail upload</button>
    <button onclick={() => toaster.dismiss()}>Dismiss all</button>
  </div>
  <div {...api.getGroupProps()}>
    {#each api.getToasts() as actor, index (actor.id)}
      <ToastItem {actor} {index} parent={service} />
    {/each}
  </div>
</main>
