<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { MinusIcon, PlusIcon } from "lucide-svelte"
  import "@styles/number-input.css"

  const min = 0
  const max = 10

  const id = $props.id()
  // No min/max on the machine, so stepping never stops at the bounds
  const service = useMachine(numberInput.machine, {
    id,
    defaultValue: 8,
    onValueChange({ value, reason }) {
      if (value == null || reason === "input-change") return
      if (value > max) api.setValue(min)
      else if (value < min) api.setValue(max)
    },
    // Typed values clamp instead of wrapping
    onValueCommit({ value }) {
      if (value == null) return
      if (value > max) api.setValue(max)
      else if (value < min) api.setValue(min)
    },
  })

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Wraps between 0 and 10</label>
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
