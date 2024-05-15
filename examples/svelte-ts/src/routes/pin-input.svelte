<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as pinInput from "@zag-js/pin-input"
  import { pinInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(pinInputControls)

  const [snapshot, send] = useMachine(
    pinInput.machine({
      name: "test",
      id: "1",
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(pinInput.connect(snapshot, send, normalizeProps))
</script>

<main class="pin-input">
  <form
    onsubmit={(e) => {
      e.preventDefault()
      const formData = serialize(e.currentTarget, { hash: true })
      console.log(formData)
    }}
  >
    <div {...api.rootProps}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.labelProps}>Enter code:</label>
      <div {...api.controlProps}>
        <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
        <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
        <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
      </div>
      <input {...api.hiddenInputProps} />
    </div>
    <button data-testid="clear-button" onclick={api.clearValue}> Clear </button>
    <button onclick={api.focus}>Focus</button>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
