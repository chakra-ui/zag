<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { comboboxData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const collection = combobox.collection({
    items: comboboxData,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const id = $props.id()
  const service = useMachine(combobox.machine, {
    id,
    collection,
    open: true,
    disableLayer: true,
    defaultHighlightedValue: comboboxData[0].code,
  })

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<svelte:head>
  {@html `<style>html, body, .page, .page main { height: auto !important; overflow: visible !important; }</style>`}
</svelte:head>

<main class="combobox">
  <div data-testid="spacer" style="height: 150vh"></div>
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <input data-testid="input" {...api.getInputProps()} />
    </div>
    <ul data-testid="combobox-content" {...api.getContentProps()} style="max-height: 12rem; overflow: auto">
      {#each comboboxData as item (item.code)}
        <li data-testid={item.code} {...api.getItemProps({ item })}>
          <span>{item.label}</span>
        </li>
      {/each}
    </ul>
  </div>
</main>
