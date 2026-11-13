<script lang="ts">
  import * as checkbox from "@zag-js/checkbox"
  import * as field from "@zag-js/field"
  import * as fieldsetMachine from "@zag-js/fieldset"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon } from "lucide-svelte"
  import "@styles/checkbox.css"
  import "@styles/field.css"

  const id = $props.id()

  let outerDisabled = $state(false)
  let innerDisabled = $state(false)

  const shippingService = useMachine(fieldsetMachine.machine, () => ({ id: `${id}-shipping`, disabled: outerDisabled }))
  const shipping = $derived(fieldsetMachine.connect(shippingService, normalizeProps))

  const addressService = useMachine(fieldsetMachine.machine, () => ({ id: `${id}-address`, disabled: innerDisabled }))
  const address = $derived(fieldsetMachine.connect(addressService, normalizeProps))

  const nameService = useMachine(field.machine, { id: `${id}-name` })
  const name = $derived(field.connect(nameService, normalizeProps))

  const streetService = useMachine(field.machine, { id: `${id}-street` })
  const street = $derived(field.connect(streetService, normalizeProps))

  const saveService = useMachine(checkbox.machine, { id: `${id}-save`, name: "save" })
  const save = $derived(checkbox.connect(saveService, normalizeProps))
</script>

<main class="field-page">
  <div class="options">
    <label> <input type="checkbox" bind:checked={outerDisabled} /> Disable shipping </label>
    <label> <input type="checkbox" bind:checked={innerDisabled} /> Disable address </label>
  </div>
  <form onsubmit={(e) => e.preventDefault()}>
    <fieldset {...shipping.getRootProps()}>
      <legend {...shipping.getLegendProps()}>Shipping</legend>
      <div {...name.getRootProps()}>
        <label {...name.getLabelProps()}>Recipient</label>
        <input {...name.getInputProps()} name="recipient" />
      </div>

      <fieldset {...address.getRootProps()}>
        <legend {...address.getLegendProps()}>Address</legend>
        <div {...street.getRootProps()}>
          <label {...street.getLabelProps()}>Street</label>
          <input {...street.getInputProps()} name="street" />
        </div>
        <label {...save.getRootProps()}>
          <div {...save.getControlProps()}>
            <span {...save.getIndicatorProps()}>
              <CheckIcon />
            </span>
          </div>
          <span {...save.getLabelProps()}>Save this address</span>
          <input {...save.getHiddenInputProps()} />
        </label>
      </fieldset>
    </fieldset>
  </form>
</main>
