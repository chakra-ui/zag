<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import ToastItem from "#lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

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
      return { description: `Saved ${saves} times.`, meta: { saves } }
    })
  }
</script>

<main>
  <div class="hstack">
    <button onclick={saveDraft}>Save draft</button>
    <button onclick={() => toaster.dismiss("draft")}>Dismiss</button>
  </div>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
