<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import ControlsPanel from "#lib/components/toolbar.svelte"
  import * as numberInput from "@zag-js/number-input"
  import * as select from "@zag-js/select"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggleGroup from "@zag-js/toggle-group"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"
  import "@styles/toggle-group.css"
  import "@styles/select.css"

  interface Font {
    label: string
    value: string
  }

  const fonts: Font[] = [
    { label: "Sans-serif", value: "sans-serif" },
    { label: "Serif", value: "serif" },
    { label: "Monospace", value: "monospace" },
  ]

  let format = $state<string[]>([])
  let align = $state("left")
  let font = $state("sans-serif")
  let fontSize = $state("16")

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))

  const fontService = useMachine(select.machine as select.Machine<Font>, () => ({
    id: `${id}-font`,
    ids: { trigger: api.getItemId("font") },
    collection: select.collection({ items: fonts }),
    disabled: api.disabled,
    defaultValue: ["sans-serif"],
    onValueChange(details) {
      font = details.value[0]
    },
  }))
  const fontApi = $derived(select.connect(fontService, normalizeProps))

  const sizeService = useMachine(numberInput.machine, () => ({
    id: `${id}-font-size`,
    ids: { input: api.getItemId("font-size") },
    disabled: api.disabled,
    defaultValue: "16",
    min: 8,
    max: 96,
    onValueChange(details) {
      fontSize = details.value
    },
  }))
  const sizeApi = $derived(numberInput.connect(sizeService, normalizeProps))

  const formatService = useMachine(toggleGroup.machine, () => ({
    id: `${id}-format`,
    disabled: api.disabled,
    orientation: api.orientation,
    multiple: true,
    defaultValue: [],
    onValueChange(details) {
      format = details.value
    },
  }))
  const formatApi = $derived(toggleGroup.connect(formatService, normalizeProps))

  const alignService = useMachine(toggleGroup.machine, () => ({
    id: `${id}-align`,
    disabled: api.disabled,
    orientation: api.orientation,
    defaultValue: ["left"],
    onValueChange(details) {
      if (details.value[0]) align = details.value[0]
    },
  }))
  const alignApi = $derived(toggleGroup.connect(alignService, normalizeProps))
</script>

<main class="toolbar">
  <div class="toolbar-editor">
    <div {...api.getRootProps()}>
      <button {...mergeProps(fontApi.getTriggerProps(), api.getItemProps({ value: "font" }))}>
        <span>{fontApi.valueAsString}</span>
        <span aria-hidden="true">▾</span>
      </button>
      <Portal>
        <div {...fontApi.getPositionerProps()}>
          <div {...fontApi.getContentProps()}>
            <ul {...fontApi.getListProps()}>
              {#each fonts as item (item.value)}
                <li {...fontApi.getItemProps({ item })}>
                  <span {...fontApi.getItemTextProps({ item })}>{item.label}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </Portal>

      <div {...api.getSeparatorProps()}></div>

      <div {...sizeApi.getControlProps()}>
        <button {...sizeApi.getDecrementTriggerProps()} aria-label="Decrease font size">−</button>
        <input
          class="toolbar-number-input"
          {...mergeProps(sizeApi.getInputProps(), api.getInputProps({ value: "font-size" }))}
        />
        <button {...sizeApi.getIncrementTriggerProps()} aria-label="Increase font size">+</button>
      </div>

      <div {...api.getSeparatorProps()}></div>

      <div {...formatApi.getRootProps()}>
        <button {...formatApi.getItemProps({ value: "bold" })} aria-label="Bold"><strong>B</strong></button>
        <button {...formatApi.getItemProps({ value: "italic" })} aria-label="Italic"><em>I</em></button>
        <button {...formatApi.getItemProps({ value: "underline" })} aria-label="Underline"><u>U</u></button>
      </div>

      <div {...api.getSeparatorProps()}></div>

      <div {...alignApi.getRootProps()}>
        <button {...alignApi.getItemProps({ value: "left" })} aria-label="Align left">⯇</button>
        <button {...alignApi.getItemProps({ value: "center" })} aria-label="Align center">≡</button>
        <button {...alignApi.getItemProps({ value: "right" })} aria-label="Align right">⯈</button>
      </div>
    </div>

    <div
      class="toolbar-editor-preview"
      style:font-weight={format.includes("bold") ? "bold" : "normal"}
      style:font-style={format.includes("italic") ? "italic" : "normal"}
      style:text-decoration={format.includes("underline") ? "underline" : "none"}
      style:text-align={align}
      style:font-family={font}
      style:font-size={`${fontSize}px`}
    >
      The quick brown fox jumps over the lazy dog.
    </div>
  </div>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>
