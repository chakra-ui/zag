<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end" })

  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<main>
  <div class="hstack">
    <button onclick={() => toaster.create({ title: "Sync complete", description: "All 24 files are up to date." })}>
      Show toast
    </button>
    <button onclick={() => toaster.pause()}>Pause all</button>
    <button onclick={() => toaster.resume()}>Resume all</button>
    <button onclick={() => toaster.dismiss()}>Dismiss all</button>
  </div>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
