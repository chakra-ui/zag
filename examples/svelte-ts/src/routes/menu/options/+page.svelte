<script lang="ts">
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "#lib/components/portal.svelte"
  import { menuOptionData, menuControls } from "@zag-js/shared"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/menu.css"

  const controls = useControls(menuControls)

  let order = $state("")
  let type = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(menu.machine, controls.mergeProps<menu.Props>({ id }))

  const api = $derived(menu.connect(service, normalizeProps))

  const radios = $derived(
    menuOptionData.order.map((item) => ({
      type: "radio" as const,
      name: "order",
      value: item.value,
      label: item.label,
      checked: order === item.value,
      onCheckedChange: (checked: boolean) => {
        order = checked ? item.value : ""
      },
    })),
  )

  const checkboxes = $derived(
    menuOptionData.type.map((item) => ({
      type: "checkbox" as const,
      name: "type",
      value: item.value,
      label: item.label,
      checked: type.includes(item.value),
      onCheckedChange: (checked: boolean) => {
        type = checked ? [...type, item.value] : type.filter((x) => x !== item.value)
      },
    })),
  )
</script>

<main>
  <div>
    <button data-testid="trigger" {...api.getTriggerProps()}>
      Actions <span {...api.getIndicatorProps()}>▾</span>
    </button>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          {#each radios as item (item.value)}
            <div {...api.getOptionItemProps(item)}>
              <span {...api.getItemIndicatorProps(item)}>✅</span>
              <span {...api.getItemTextProps(item)}>{item.label}</span>
            </div>
          {/each}
          <hr />
          {#each checkboxes as item (item.value)}
            <div {...api.getOptionItemProps(item)}>
              <span {...api.getItemIndicatorProps(item)}>✅</span>
              <span {...api.getItemTextProps(item)}>{item.label}</span>
            </div>
          {/each}
        </div>
      </div>
    </Portal>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
