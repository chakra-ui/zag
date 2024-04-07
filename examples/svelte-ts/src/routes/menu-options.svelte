<script lang="ts">
  import { useControls } from "$lib/use-controls.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { menuOptionData, menuControls } from "@zag-js/shared"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(menuControls)

  let order = $state("")
  let type = $state<string[]>([])

  const [_state, send] = useMachine(menu.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(menu.connect(_state, send, normalizeProps))

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
    <button data-testid="trigger" {...api.triggerProps}>
      Actions <span {...api.indicatorProps}>▾</span>
    </button>

    <div use:portal {...api.positionerProps}>
      <div {...api.contentProps}>
        {#each radios as item}
          <div {...api.getOptionItemProps(item)}>
            <span {...api.getItemIndicatorProps(item)}>✅</span>
            <span {...api.getItemTextProps(item)}>{item.label}</span>
          </div>
        {/each}
        <hr {...api.separatorProps} />
        {#each checkboxes as item}
          <div {...api.getOptionItemProps(item)}>
            <span {...api.getItemIndicatorProps(item)}>✅</span>
            <span {...api.getItemTextProps(item)}>{item.label}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={_state} />
</Toolbar>
