<script lang="ts">
  import ToastItem from "$lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"

  const toaster = toast.createStore<string>({ placement: "bottom-end", overlap: false, duration: Infinity })
  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))

  function saveDraft() {
    if (!toaster.isVisible("draft")) {
      toaster.create({ id: "draft", title: "Draft saved", description: "Saved 1 time.", meta: { saves: 1 } })
      return
    }

    toaster.update("draft", (prev) => {
      const saves = (prev.meta?.saves ?? 0) + 1

      return {
        description: `Saved ${saves} times.`,
        meta: { saves },
      }
    })
  }
</script>

<main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
  <h1>Deduplicated toasts</h1>
  <p>Repeated saves update one persistent toast. Close it, then save again to start a new count.</p>
  <div style="display: flex; flex-wrap: wrap; gap: 8px">
    <button onclick={saveDraft}>Save draft</button>
    <button onclick={() => toaster.dismiss("draft")}>Dismiss draft</button>
  </div>
  <div {...api.getGroupProps()}>
    {#each api.getToasts() as actor, index (actor.id)}
      <ToastItem {actor} {index} parent={service} />
    {/each}
  </div>
</main>
