<script lang="ts">
  import { Star } from "#lib/components/rating-icons.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as rating from "@zag-js/rating-group"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/rating-group.css"

  let value = $state(2)

  const id = $props.id()
  const service = useMachine(rating.machine, () => ({
    id,
    value,
    onValueChange(details) {
      value = details.value
    },
  }))

  const api = $derived(rating.connect(service, normalizeProps))
</script>

<main class="rating">
  <div class="vstack gap-4">
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Rate this example</label>
      <div {...api.getControlProps()}>
        {#each api.items as index (index)}
          <span {...api.getItemProps({ index })}>
            {@render Star()}
          </span>
        {/each}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>

    <output>Value: {value}</output>

    <div class="hstack">
      <button type="button" onclick={() => (value = 4)}>Set to 4</button>
      <button type="button" onclick={() => (value = 0)}>Clear</button>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
