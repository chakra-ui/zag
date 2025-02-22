<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { toastControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"

  const controls = useControls(toastControls)

  const toaster = toast.createStore({
    placement: "bottom",
    overlap: false,
  })

  const service = useMachine(toast.group.machine, {
    id: "1",
    store: toaster,
  })

  const api = $derived(toast.group.connect(service, normalizeProps))

  let id: string | undefined = ""
</script>

<main>
  <div style="display:flex;gap:16px;">
    <button
      onclick={() => {
        toaster.create({
          title: "Fetching data...",
          type: "loading",
        })
      }}
    >
      Notify (Loading)
    </button>
    <button
      onclick={() => {
        id = toaster.create({
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
        toaster.update(id, {
          title: "Testing",
          type: "loading",
        })
      }}
    >
      Update Latest
    </button>
    <button onclick={() => toaster.dismiss()}>Close all</button>
    <button onclick={() => toaster.pause()}>Pause all</button>
    <button onclick={() => toaster.resume()}>Resume all</button>
  </div>

  <pre>{JSON.stringify(api.getToasts(), null, 2)}</pre>

  <div {...api.getGroupProps()}>
    {#each api.getToasts() as toast, index (toast.id)}
      <ToastItem actor={toast} parent={service} {index} />
    {/each}
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} />
</Toolbar>
