<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as radio from "@zag-js/radio-group"
  import { radioControls, radioData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(radioControls)

  const [state, send] = useMachine(radio.machine({ id: "2", name: "fruit", orientation: "horizontal" }), {
    context: controls.context,
  })

  const api = $derived(radio.connect(state, send, normalizeProps))
</script>

<main class="segmented-control">
  <div {...api.rootProps}>
    <div {...api.indicatorProps}></div>
    {#each radioData as opt}
      <label data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
        <span data-testid={`label-${opt.id}`} {...api.getItemTextProps({ value: opt.id })}>
          {opt.label}
        </span>
        <input data-testid={`input-${opt.id}`} {...api.getItemHiddenInputProps({ value: opt.id })} />
      </label>
    {/each}
  </div>
  <button onclick={api.clearValue}>reset</button>
</main>

<Toolbar {controls}>
  <StateVisualizer {state} />
</Toolbar>
