<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as radio from "@zag-js/radio-group"
  import { shippingOptions } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/radio-group.css"

  const id = $props.id()
  const service = useMachine(radio.machine, {
    id,
    name: "shipping",
    defaultValue: "standard",
  })

  const api = $derived(radio.connect(service, normalizeProps))
</script>

<main>
  <div class="shipping-options">
    <p class="hint">Focus a method and use the arrow keys to switch.</p>
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Shipping method</span>
      {#each shippingOptions as opt (opt.id)}
        <label data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
          <div {...api.getItemControlProps({ value: opt.id })}></div>
          <span {...api.getItemTextProps({ value: opt.id })}>
            <span class="name">{opt.label}</span>
            <span class="price">{opt.price}</span>
            <span class="detail">{opt.delivery}</span>
          </span>
          <input {...api.getItemHiddenInputProps({ value: opt.id })} />
        </label>
      {/each}
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
