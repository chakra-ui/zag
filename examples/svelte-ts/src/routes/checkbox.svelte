<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as checkbox from "@zag-js/checkbox"
  import { checkboxControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(checkboxControls)

  const machine = useMachine(checkbox.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(checkbox.connect(machine.state, machine.send, normalizeProps))
</script>

<main class="checkbox">
  <form
    onChange={(e) => {
      const result = serialize(e.currentTarget, { hash: true })
      console.log(result)
    }}
  >
    <fieldset>
      <label {...api.rootProps}>
        <div {...api.controlProps} />
        <span {...api.labelProps}>Input {api.isChecked ? "Checked" : "Unchecked"}</span>
        <input {...api.hiddenInputProps} data-testid="hidden-input" />
        <div {...api.indicatorProps}>Indicator</div>
      </label>

      <button type="button" disabled={api.isChecked} onclick={() => api.setChecked(true)}>Check</button>
      <button type="button" disabled={!api.isChecked} onclick={() => api.setChecked(false)}>Uncheck</button>
      <button type="reset">Reset Form</button>
    </fieldset>
  </form>
</main>

<Toolbar {controls} {machine} />
