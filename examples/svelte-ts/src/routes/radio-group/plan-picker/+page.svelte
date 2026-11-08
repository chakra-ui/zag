<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as radio from "@zag-js/radio-group"
  import { planOptions } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/radio-group.css"

  let value = $state<string | null>("free")

  const id = $props.id()
  const service = useMachine(radio.machine, () => ({
    id,
    name: "plan",
    value,
    onValueChange: (details: radio.ValueChangeDetails) => {
      value = details.value
    },
  }))

  const api = $derived(radio.connect(service, normalizeProps))
  const selected = $derived(planOptions.find((plan) => plan.id === value))
</script>

<main>
  <div class="plan-picker">
    <p class="hint">Pick a plan, or use the button to switch to Team.</p>
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Plan</span>
      {#each planOptions as opt (opt.id)}
        <label data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id, disabled: opt.disabled })}>
          <div {...api.getItemControlProps({ value: opt.id, disabled: opt.disabled })}></div>
          <span {...api.getItemTextProps({ value: opt.id, disabled: opt.disabled })}>
            <span class="name">{opt.label}</span>
            <span class="price">{opt.price}</span>
            <span class="detail">{opt.note}</span>
          </span>
          <input {...api.getItemHiddenInputProps({ value: opt.id, disabled: opt.disabled })} />
        </label>
      {/each}
    </div>
    <p class="selected" data-testid="selected-plan" role="status">Selected plan: {selected?.label ?? "None"}</p>
    <div class="actions">
      <button type="button" onclick={() => (value = "team")}>Switch to Team</button>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
