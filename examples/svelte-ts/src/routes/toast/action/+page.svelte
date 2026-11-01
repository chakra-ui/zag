<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import ToastItem from "#lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })

  let saved = $state(true)
  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))

  function removeBookmark() {
    saved = false
    toaster.create({
      title: "Bookmark removed",
      action: {
        label: "Undo",
        onClick: () => (saved = true),
      },
    })
  }
</script>

<main>
  <p>{saved ? "Saved to reading list" : "Removed from reading list"}</p>
  <button disabled={!saved} onclick={removeBookmark}>Remove bookmark</button>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
