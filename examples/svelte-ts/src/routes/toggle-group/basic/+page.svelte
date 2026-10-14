<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle-group"
  import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-svelte"
  import "@styles/toggle-group.css"

  const icons = { bold: BoldIcon, italic: ItalicIcon, underline: UnderlineIcon }

  const controls = useControls(toggleGroupControls)

  const id = $props.id()
  const service = useMachine(toggle.machine, controls.mergeProps<toggle.Props>({ id }))

  const api = $derived(toggle.connect(service, normalizeProps))
</script>

<main class="toggle-group">
  <div class="hstack gap-4">
    <!-- Focus target outside the group, for tab order checks -->
    <button>Outside</button>
    <div {...api.getRootProps()}>
      {#each toggleGroupData as item (item.value)}
        {@const Icon = icons[item.value as keyof typeof icons]}
        <button {...api.getItemProps({ value: item.value })} aria-label={item.value}>
          <Icon />
        </button>
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["focusedValue"]} />
</Toolbar>
