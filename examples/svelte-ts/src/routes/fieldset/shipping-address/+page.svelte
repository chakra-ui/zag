<script lang="ts">
  import * as field from "@zag-js/field"
  import * as fieldsetMachine from "@zag-js/fieldset"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/field.css"
  import "@styles/fieldset.css"

  let sameAsBilling = $state(false)
  let output = $state("")

  const id = $props.id()
  const fieldsetService = useMachine(fieldsetMachine.machine, () => ({
    id,
    disabled: sameAsBilling,
  }))
  const fieldsetApi = $derived(fieldsetMachine.connect(fieldsetService, normalizeProps))

  // disabled inheritance is DOM-based: the fields pick it up from <fieldset disabled>
  const streetService = useMachine(field.machine, { id: `${id}-street` })
  const streetApi = $derived(field.connect(streetService, normalizeProps))

  const postalService = useMachine(field.machine, { id: `${id}-postal` })
  const postalApi = $derived(field.connect(postalService, normalizeProps))
</script>

<main>
  <div class="field-page shipping-address">
    <p class="hint">Tick "Same as billing address" to disable every field.</p>
    <form
      onsubmit={(e) => {
        e.preventDefault()
        output = JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)), null, 2)
      }}
      onreset={() => {
        sameAsBilling = false
        output = ""
      }}
    >
      <label class="same-as-billing">
        <input type="checkbox" name="sameAsBilling" bind:checked={sameAsBilling} />
        Same as billing address
      </label>
      <fieldset {...fieldsetApi.getRootProps()}>
        <legend {...fieldsetApi.getLegendProps()}>Shipping address</legend>
        <span {...fieldsetApi.getHelperTextProps()}>Where should we deliver your order?</span>
        <div {...streetApi.getRootProps()}>
          <label {...streetApi.getLabelProps()}>Street address</label>
          <input {...streetApi.getInputProps()} name="street" placeholder="1600 Pennsylvania Avenue NW" />
        </div>
        <div {...postalApi.getRootProps()}>
          <label {...postalApi.getLabelProps()}>Postal code</label>
          <input {...postalApi.getInputProps()} name="postalCode" placeholder="20500" />
        </div>
      </fieldset>
      <div class="actions">
        <button type="submit">Save address</button>
        <button type="reset">Reset</button>
      </div>
    </form>
    {#if output}
      <pre class="output" data-testid="form-output">{output}</pre>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={fieldsetService} />
  <StateVisualizer state={streetService} />
  <StateVisualizer state={postalService} />
</Toolbar>
