<script lang="ts">
  import { useControls } from "$lib/use-controls.svelte"
  import { toastControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import ToastItem from "$lib/components/toast-item.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(toastControls)

  const [state, send] = useMachine(toast.group.machine({ id: "1", placement: "top-start" }), {
    context: controls.context,
  })

  const api = $derived(toast.group.connect(state, send, normalizeProps))

  const placements = $derived(Object.keys(api.toastsByPlacement)) as toast.Placement[]
  let id: string | undefined = ""
</script>

<main>
  <div style="display:flex;gap:16px;">
    <button
      onclick={() => {
        id = api.create({
          title: "Welcome",
          description: "This a notification",
          type: "info",
        })
      }}
    >
      Notify (Info)
    </button>
    <button
      onclick={() => {
        api.create({
          placement: "bottom-start",
          title: "Ooops! Something was wrong",
          type: "error",
        })
      }}
    >
      Notify (Error)
    </button>
    <button
      onclick={() => {
        if (!id) return
        api.update(id, {
          title: "Testing",
          type: "loading",
        })
      }}
    >
      Update Child (info)
    </button>
    <button onclick={() => api.dismiss()}>Close all</button>
    <button onclick={() => api.pause()}>Pause all</button>
    <button onclick={() => api.resume()}>Resume all</button>
  </div>

  {#each placements as placement}
    <div {...api.getGroupProps({ placement })}>
      {#each api.toastsByPlacement[placement]! as actor}
        <ToastItem {actor} />
      {/each}
    </div>
  {/each}
</main>

<Toolbar {controls}>
  <StateVisualizer {state} />
</Toolbar>
