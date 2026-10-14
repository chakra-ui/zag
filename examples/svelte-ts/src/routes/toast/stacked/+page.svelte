<script lang="ts">
  import Dialog from "$lib/components/dialog.svelte"
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ToastItem from "$lib/components/toast-item.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { toastControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({
    overlap: false,
    placement: "bottom",
    gap: 24,
  })

  const controls = useControls(toastControls)

  const uid = $props.id()
  const service = useMachine(
    toast.group.machine,
    controls.mergeProps<toast.GroupProps>({
      id: uid,
      store: toaster,
    }),
  )

  const api = $derived(toast.group.connect(service, normalizeProps))

  let id: string | undefined
</script>

{#snippet jsxTitle()}
  <h1 style="color: red">Hello</h1>
{/snippet}

{#snippet jsxDescription()}
  <p>This is a description</p>
{/snippet}

<main>
  <Dialog />
  <div style="display: flex; flex-wrap: wrap; gap: 16px; max-width: 640px">
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
          onStatusChange(details) {
            console.log(details)
          },
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
    <button
      onclick={() => {
        if (!id) return
        toaster.update(id, (prev) => ({
          title: `${prev.title} (updated)`,
        }))
      }}
    >
      Append to Latest
    </button>
    <button
      class="toast-button"
      onclick={() => {
        const promise = new Promise<{ name: string }>((resolve) => {
          setTimeout(() => {
            resolve({ name: "Chakra" })
          }, 3000)
        })

        toaster.promise(promise, {
          loading: { title: "Creating toast..." },
          success: (data) => {
            return { title: `${data.name} toast added` }
          },
          error: { title: "Error" },
        })
      }}
    >
      Promise
    </button>
    <button
      onclick={() => {
        toaster.create({
          type: "info",
          title: jsxTitle as any,
          description: jsxDescription as any,
        })
      }}
    >
      Create (JSX)
    </button>

    <button onclick={() => toaster.dismiss()}>Close all</button>
    <button onclick={() => toaster.pause()}>Pause all</button>
    <button onclick={() => toaster.resume()}>Resume all</button>
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
