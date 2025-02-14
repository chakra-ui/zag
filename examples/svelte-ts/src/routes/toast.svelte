<!-- <script lang="ts">
  import { useControls } from "$lib/use-controls.svelte"
  import { toastControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import ToastItem from "$lib/components/toast-item.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(toastControls)

  const [snapshot, send] = useMachine(
    toast.group.machine({
      id: "1",
      placement: "bottom-end",
      overlap: true,
      removeDelay: 200,
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(toast.group.connect(snapshot, send, normalizeProps))
  let id: string | undefined = ""
</script>

<main>
  <div style="display:flex;gap:16px;">
    <button
      onclick={() => {
        api.create({
          title: "Fetching data...",
          type: "loading",
        })
      }}
    >
      Notify (Loading)
    </button>
    <button
      onclick={() => {
        id = api.create({
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
      Update Latest
    </button>
    <button onclick={() => api.dismiss()}>Close all</button>
    <button onclick={() => api.pause()}>Pause all</button>
    <button onclick={() => api.resume()}>Resume all</button>
  </div>

  {#each api.getPlacements() as placement}
    <div {...api.getGroupProps({ placement })}>
      {#each api.getToastsByPlacement(placement) as toast (toast.id)}
        <ToastItem actor={toast} />
      {/each}
    </div>
  {/each}
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={snapshot} />
</Toolbar> -->
