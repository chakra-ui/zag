<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as rating from "@zag-js/rating-group"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { HeartIcon } from "lucide-svelte"
  import "@styles/rating-group.css"

  const id = $props.id()
  const service = useMachine(rating.machine, {
    id,
    defaultValue: 3,
  })

  const api = $derived(rating.connect(service, normalizeProps))
</script>

<main class="rating">
  <div {...mergeProps(api.getRootProps(), { style: { "--rating-color": "var(--z-red-500)" } })}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>How much do you love it?</label>
    <div {...api.getControlProps()}>
      {#each api.items as index (index)}
        <span {...api.getItemProps({ index })}>
          <HeartIcon fill="currentColor" strokeWidth={0} />
        </span>
      {/each}
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
