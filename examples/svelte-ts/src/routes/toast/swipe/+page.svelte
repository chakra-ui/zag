<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import ToastItem from "#lib/components/toast-item.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import "@styles/toast.css"

  const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

  const variants: Array<{ label: string; swipeDirections?: toast.SwipeDirection[] }> = [
    { label: "Default" },
    { label: "Right", swipeDirections: ["right"] },
    { label: "Up and right", swipeDirections: ["up", "right"] },
    { label: "Left and right", swipeDirections: ["left", "right"] },
    { label: "Up and down", swipeDirections: ["up", "down"] },
    { label: "No swipe", swipeDirections: [] },
  ]

  const uid = $props.id()
  const service = useMachine(toast.group.machine, { id: uid, store: toaster })
  const api = $derived(toast.group.connect(service, normalizeProps))
</script>

<main>
  <div class="hstack">
    {#each variants as { label, swipeDirections } (label)}
      <button
        onclick={() => toaster.create({ title: `Swipe: ${label}`, description: "Drag to dismiss", swipeDirections })}
      >
        {label}
      </button>
    {/each}
  </div>
  <Portal>
    <div {...api.getGroupProps()}>
      {#each api.getToasts() as actor, index (actor.id)}
        <ToastItem {actor} {index} parent={service} />
      {/each}
    </div>
  </Portal>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
