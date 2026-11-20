<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as select from "@zag-js/select"
  import { groupedData, selectControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/select.css"

  type Item = (typeof groupedData)[number]

  const controls = useControls(selectControls)

  const id = $props.id()
  const service = useMachine(
    select.machine as select.Machine<Item>,
    controls.mergeProps<select.Props<Item>>({
      collection: select.collection({ items: groupedData, groupBy: (item) => item.type }),
      id,
    }),
  )

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select option"}</span>
        <span {...api.getIndicatorProps()}>▼</span>
      </button>
      <button {...api.getClearTriggerProps()}>X</button>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getListProps()}>
            {#each api.collection.group() as [type, items] (type)}
              <div {...api.getItemGroupProps({ id: type })}>
                <div {...api.getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                {#each items as item (item.value)}
                  <div {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                {/each}
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
