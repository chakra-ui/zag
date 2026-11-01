<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import ToastItem from "#lib/components/toast-item.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { toastControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end" })

  const controls = useControls(toastControls)

  const uid = $props.id()
  const service = useMachine(toast.group.machine, controls.mergeProps<toast.GroupProps>({ id: uid, store: toaster }))
  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<main>
  <div class="hstack">
    <button onclick={() => toaster.create({ title: "Event created", description: "Sunday, December 3 at 9:00 AM" })}>
      Show toast
    </button>
    <button onclick={() => toaster.success({ title: "Changes saved" })}>Success</button>
    <button onclick={() => toaster.error({ title: "Couldn't save changes", description: "Check your connection." })}>
      Error
    </button>
    <button onclick={() => toaster.warning({ title: "Storage almost full", description: "90% of 5 GB used." })}>
      Warning
    </button>
    <button onclick={() => toaster.info({ title: "A new version is available" })}>Info</button>
    <button onclick={() => toaster.loading({ title: "Uploading files…" })}>Loading</button>
  </div>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
