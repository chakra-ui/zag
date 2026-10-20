<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"

  interface Props {
    store: toast.Store
  }

  const { store }: Props = $props()

  const uid = $props.id()
  const service = useMachine(toast.group.machine, () => ({ id: uid, store }))
  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<Portal>
  <div {...api.getGroupProps()}>
    {#each api.getToasts() as actor, index (actor.id)}
      <ToastItem {actor} {index} parent={service} />
    {/each}
  </div>
</Portal>
