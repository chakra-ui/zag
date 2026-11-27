<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import ToastItem from "#lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", duration: 10000 })
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  let archived = $state(false)
  let failUndo = $state(false)
  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))

  function archiveMessage() {
    archived = true
    const fail = failUndo
    let undoing = false
    const id = toaster.create({
      title: "Message archived",
      action: {
        label: "Undo",
        onClick(event) {
          // keep the toast open while the undo runs
          event.preventDefault()
          if (undoing) return
          undoing = true
          toaster.pause(id)
          toaster.update(id, { title: "Undoing…" })
          wait(800).then(() => {
            undoing = false
            if (fail) {
              toaster.update(id, { title: "Couldn't undo. Try again." })
              toaster.resume(id)
              return
            }
            archived = false
            toaster.dismiss(id)
          })
        },
      },
    })
  }
</script>

<main>
  <p>{archived ? "Message archived" : "Message in inbox"}</p>
  <label><input type="checkbox" bind:checked={failUndo} /> Fail the undo</label>
  <button disabled={archived} onclick={archiveMessage}>Archive message</button>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
