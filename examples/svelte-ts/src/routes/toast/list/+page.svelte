<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { toastControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", overlap: false })

  const messages = [
    { title: "Message sent", description: "Your message to Ada was delivered." },
    { title: "File uploaded" },
    { title: "Invite accepted", description: "Grace joined the design team and can now edit shared files." },
  ]

  let count = 0

  const controls = useControls(toastControls)

  const uid = $props.id()
  const service = useMachine(toast.group.machine, controls.mergeProps<toast.GroupProps>({ id: uid, store: toaster }))
  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<main>
  <button onclick={() => toaster.create(messages[count++ % messages.length])}>Show toast</button>
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
