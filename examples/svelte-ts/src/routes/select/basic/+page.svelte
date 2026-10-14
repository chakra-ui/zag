<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as select from "@zag-js/select"
  import { selectControls, selectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"
  import { ChevronsUpDownIcon, XIcon } from "lucide-svelte"
  import "@styles/select.css"

  interface Item {
    label: string
    value: string
  }

  const controls = useControls(selectControls)

  const id = $props.id()
  const service = useMachine(
    select.machine as select.Machine<Item>,
    controls.mergeProps<select.Props<Item>>({
      collection: select.collection({ items: selectData }),
      id,
      name: "country",
      onHighlightChange(details) {
        console.log("onHighlightChange", details)
      },
      onValueChange(details) {
        console.log("onChange", details)
      },
      onOpenChange(details) {
        console.log("onOpenChange", details)
      },
    }),
  )

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select option"}</span>
      </button>
      <div class="select-indicator-group">
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </div>
    </div>

    <form
      onchange={(e) => {
        const formData = serialize(e.currentTarget, { hash: true })
        console.log(formData)
      }}
    >
      <select {...api.getHiddenSelectProps()}>
        {#if api.empty}
          <option value=""></option>
        {/if}
        {#each selectData as option (option.value)}
          <option value={option.value}>
            {option.label}
          </option>
        {/each}
      </select>
    </form>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getListProps()}>
            {#each selectData as item (item.value)}
              <div {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
