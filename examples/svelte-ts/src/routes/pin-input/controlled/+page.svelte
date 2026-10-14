<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as pinInput from "@zag-js/pin-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/pin-input.css"

  let value = $state(["", "", ""])

  const id = $props.id()
  const service = useMachine(pinInput.machine, () => ({
    id,
    name: "test",
    count: 3,
    value,
    onValueChange(details) {
      value = details.value
    },
  }))

  const api = $derived(pinInput.connect(service, normalizeProps))
</script>

<main class="pin-input">
  <form
    class="vstack gap-4"
    onsubmit={(e) => {
      e.preventDefault()
      console.log("submitted:", value.join(""))
    }}
  >
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Enter code:</label>
      <div {...api.getControlProps()}>
        {#each api.items as index (index)}
          <input data-testid={`input-${index + 1}`} {...api.getInputProps({ index })} />
        {/each}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>

    <div class="hstack">
      <button type="button" data-testid="clear-button" onclick={api.clearValue}>Clear</button>
      <button type="button" onclick={api.focus}>Focus</button>
      <button type="button" data-testid="set-value" onclick={() => (value = ["1", "2", "3"])}>Set 1-2-3</button>
      <button type="button" data-testid="reset-value" onclick={() => (value = ["", "", ""])}>Reset</button>
    </div>
  </form>

  <div style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px">
    <strong>Controlled value:</strong> [{value.map((v) => `"${v}"`).join(", ")}]
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["value", "focusedIndex"]} />
</Toolbar>
