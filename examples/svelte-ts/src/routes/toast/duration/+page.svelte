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
    <button onclick={() => toaster.create({ title: "Closes in 2 seconds", duration: 2000 })}>2 seconds</button>
    <button onclick={() => toaster.create({ title: "Closes in 10 seconds", duration: 10000 })}>10 seconds</button>
    <button onclick={() => toaster.create({ title: "Stays until dismissed", duration: Infinity })}>Persistent</button>
  </div>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>
