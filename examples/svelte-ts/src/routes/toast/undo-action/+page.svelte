<script lang="ts">
  import ToastItem from "$lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"

  const toaster = toast.createStore<string>({ placement: "bottom-end", duration: 10000 })
  let saved = $state(true)
  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))

  function removeBookmark() {
    saved = false
    toaster.create({
      title: "Bookmark removed",
      description: "Undo to put it back in your reading list.",
      action: {
        label: "Undo",
        onClick() {
          saved = true
          toaster.create({ title: "Bookmark restored", type: "success" })
        },
      },
    })
  }
</script>

<main style="display: grid; align-content: start; gap: 24px; max-width: 640px">
  <h1>Undo action</h1>
  <p>Remove a bookmark, then use Undo in the notification to restore it.</p>
  <section>
    <h2>Designing accessible notifications</h2>
    <p role="status">{saved ? "Saved to reading list" : "Removed from reading list"}</p>
    <button disabled={!saved} onclick={removeBookmark}>Remove bookmark</button>
  </section>
  <div {...api.getGroupProps()}>
    {#each api.getToasts() as actor, index (actor.id)}
      <ToastItem {actor} {index} parent={service} />
    {/each}
  </div>
</main>
