<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { MinusIcon, PlusIcon } from "lucide-svelte"
  import "@styles/number-input.css"

  const min = 0
  const max = 10

  const id = $props.id()
  const service = useMachine(numberInput.machine, {
    id,
    allowOverflow: true,
    max,
    min,
    onValueInvalid(details) {
      if (details.valueAsNumber > max) {
        api.setValue(min)
      } else if (details.valueAsNumber < min) {
        api.setValue(max)
      }
    },
  })

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Enter number:</label>
    <div {...api.getControlProps()}>
      <button {...api.getDecrementTriggerProps()}>
        <MinusIcon />
      </button>
      <input {...api.getInputProps()} />
      <button {...api.getIncrementTriggerProps()}>
        <PlusIcon />
      </button>
    </div>
  </div>
</main>
