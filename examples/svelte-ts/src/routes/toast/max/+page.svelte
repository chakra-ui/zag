<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", max: 2, duration: Infinity })

  let started = $state(false)
  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))

  function updateWaiting() {
    for (let i = 0; i < 2; i++) {
      toaster.update("waiting", (prev) => {
        const updates = (prev.meta?.updates ?? 0) + 1
        return { title: `Toast 3 (updated ${updates} times)`, meta: { updates } }
      })
    }
  }

  function dismissOldest() {
    const oldest = toaster.getVisibleToasts().at(-1)
    if (oldest?.id) toaster.dismiss(oldest.id)
  }

  function start() {
    toaster.create({ id: "first", title: "Toast 1" })
    toaster.create({ id: "second", title: "Toast 2" })
    toaster.create({ id: "waiting", title: "Toast 3", description: "Waited for a free slot.", meta: { updates: 0 } })
    started = true
  }

  function reset() {
    toaster.remove()
    started = false
  }
</script>

<main>
  <div class="hstack">
    <button disabled={started} onclick={start}>Create three toasts</button>
    <button disabled={!started} onclick={updateWaiting}>Update waiting toast</button>
    <button disabled={!started} onclick={() => toaster.dismiss("waiting")}>Dismiss waiting toast</button>
    <button disabled={!started} onclick={dismissOldest}>Dismiss oldest</button>
    <button onclick={reset}>Reset</button>
  </div>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
