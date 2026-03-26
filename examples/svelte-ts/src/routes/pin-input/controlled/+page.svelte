<script lang="ts">
  import styles from "../../../../../../shared/src/css/pin-input.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as pinInput from "@zag-js/pin-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let value = $state(["", "", ""])

  const id = $props.id()
  const service = useMachine(pinInput.machine, {
    name: "test",
    id,
    count: 3,
    get value() {
      return value
    },
    onValueChange(details) {
      value = details.value
    },
  })

  const api = $derived(pinInput.connect(service, normalizeProps))
</script>

<main class="pin-input">
  <form
    onsubmit={(e) => {
      e.preventDefault()
      console.log("submitted:", value.join(""))
    }}
  >
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()} class={styles.Label}>Enter code:</label>
      <div {...api.getControlProps()} class={styles.Control}>
        {#each api.items as index}
          <input data-testid={`input-${index + 1}`} {...api.getInputProps({ index })} class={styles.Input} />
        {/each}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>

    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem">
      <button type="button" data-testid="clear-button" onclick={api.clearValue}>Clear</button>
      <button type="button" onclick={api.focus}>Focus</button>
      <button type="button" data-testid="set-value" onclick={() => (value = ["1", "2", "3"])}>Set 1-2-3</button>
      <button type="button" data-testid="reset-value" onclick={() => (value = ["", "", ""])}>Reset</button>
    </div>
  </form>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
