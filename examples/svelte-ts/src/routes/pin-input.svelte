<script lang="ts">
  import * as pinInput from "@zag-js/pin-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { pinInputControls } from "@zag-js/shared"
  import serialize from "form-serialize"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  const controls = useControls(pinInputControls)

  const [_state, send] = useMachine(
    pinInput.machine({
      name: "test",
      id: "1",
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(pinInput.connect(_state, send, normalizeProps))
</script>

<main class="pin-input">
  <form
    onSubmit={(e) => {
      e.preventDefault()
      const formData = serialize(e.currentTarget, { hash: true })
      console.log(formData)
    }}
  >
    <div {...api.rootProps}>
      <!-- svelte-ignore a11y-label-has-associated-control -->
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

<Toolbar {controls} state={_state} />
