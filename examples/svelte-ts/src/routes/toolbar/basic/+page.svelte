<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as select from "@zag-js/select"
  import { toolbarControls, toolbarData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, portal, useMachine } from "@zag-js/svelte"
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
    { label: "Helvetica", value: "helvetica" },
    { label: "Arial", value: "arial" },
    { label: "Georgia", value: "georgia" },
  ]

  const controls = useControls(toolbarControls)

  const id = $props.id()
  const service = useMachine(toolbar.machine, controls.mergeProps<toolbar.Props>({ id }))
  const api = $derived(toolbar.connect(service, normalizeProps))

  const alignmentService = useMachine(toggleGroup.machine, () => ({
    id: `${id}-alignment`,
    disabled: api.disabled,
    orientation: api.orientation,
    defaultValue: ["left"],
  }))
  const alignmentApi = $derived(toggleGroup.connect(alignmentService, normalizeProps))

  const fontService = useMachine(select.machine, () => ({
    id: `${id}-font`,
    ids: { trigger: api.getItemId("font") },
    collection: select.collection({ items: fonts }),
    disabled: api.disabled,
    defaultValue: ["helvetica"],
  }))
  const fontApi = $derived(select.connect(fontService, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <div {...alignmentApi.getRootProps()}>
      <button {...alignmentApi.getItemProps({ value: "left" })} aria-label="Align left">⯇</button>
      <button {...alignmentApi.getItemProps({ value: "right" })} aria-label="Align right">⯈</button>
    </div>

    <div {...api.getSeparatorProps()}></div>

    <div {...api.getGroupProps({ value: "clipboard" })}>
      {#each toolbarData as item}
        <button {...api.getItemProps({ value: item.id })}>{item.label}</button>
      {/each}
    </div>

    <div {...api.getSeparatorProps()}></div>

    <button {...mergeProps(fontApi.getTriggerProps(), api.getItemProps({ value: "font" }))}>
      <span>{fontApi.valueAsString || "Font"}</span>
      <span aria-hidden="true">▾</span>
    </button>
    <div use:portal {...fontApi.getPositionerProps()}>
      <ul {...fontApi.getContentProps()}>
        {#each fonts as item}
          <li {...fontApi.getItemProps({ item })}>
            <span {...fontApi.getItemTextProps({ item })}>{item.label}</span>
          </li>
        {/each}
      </ul>
    </div>

    <div {...api.getSeparatorProps()}></div>

    <a {...api.getLinkProps({ value: "edited" })} href="https://zagjs.com" target="_blank" rel="noreferrer">
      Edited 51m ago
    </a>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
