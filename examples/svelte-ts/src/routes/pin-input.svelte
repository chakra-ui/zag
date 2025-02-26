<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as pinInput from "@zag-js/pin-input"
  import { pinInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(pinInputControls)

  const service = useMachine(pinInput.machine, {
    name: "test",
    id: "1",
    count: 3,
  })

  const api = $derived(pinInput.connect(service, normalizeProps))
</script>

<main class="pin-input">
  <form
    onsubmit={(e) => {
      e.preventDefault()
      const formData = serialize(e.currentTarget, { hash: true })
      console.log(formData)
    }}
  >
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Enter code:</label>
      <div {...api.getControlProps()}>
        {#each api.items as index}
          <input data-testid={`input-${index + 1}`} {...api.getInputProps({ index })} />
        {/each}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
    <button data-testid="clear-button" onclick={api.clearValue}> Clear </button>
    <button onclick={api.focus}>Focus</button>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
