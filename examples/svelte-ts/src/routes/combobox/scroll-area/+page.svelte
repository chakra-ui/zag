<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import * as scrollArea from "@zag-js/scroll-area"
  import { comboboxData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  const { contains } = createFilter({ sensitivity: "base" })

  let options = $state.raw(comboboxData)

  const collection = $derived(
    combobox.collection({
      items: options,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  // The content doubles as the scroll area viewport, so both machines share one id
  const contentId = `${id}:content`

  const service = useMachine(combobox.machine, {
    id,
    ids: { content: contentId },
    get collection() {
      return collection
    },
    defaultValue: ["TG"],
    onOpenChange() {
      options = comboboxData
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      options = filtered.length > 0 ? filtered : comboboxData
    },
  })

  const api = $derived(combobox.connect(service, normalizeProps))

  const scrollAreaService = useMachine(scrollArea.machine, {
    id: `${id}:scroll-area`,
    ids: { viewport: contentId },
  })

  const scrollAreaApi = $derived(scrollArea.connect(scrollAreaService, normalizeProps))
</script>

<main class="combobox">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Select country</label>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps()} />
      <button {...api.getTriggerProps()}>▼</button>
    </div>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...mergeProps(scrollAreaApi.getRootProps(), { style: "width: auto; height: auto" })}>
      <ul {...mergeProps(scrollAreaApi.getViewportProps(), api.getContentProps(), { style: "scrollbar-width: none" })}>
        {#each options as item (item.code)}
          <li {...api.getItemProps({ item })}>
            <span {...api.getItemIndicatorProps({ item })}>✅</span>
            <span>{item.label}</span>
          </li>
        {/each}
      </ul>
      <div {...scrollAreaApi.getScrollbarProps({ orientation: "vertical" })}>
        <div {...scrollAreaApi.getThumbProps({ orientation: "vertical" })}></div>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
