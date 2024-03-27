<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
  import * as toggle from "@zag-js/toggle-group"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  const controls = useControls(toggleGroupControls)

  const [_state, send] = useMachine(toggle.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(toggle.connect(_state, send, normalizeProps))
</script>

<main class="toggle-group">
  <button>Outside</button>
  <div {...api.rootProps}>
    {#each toggleGroupData as item}
      <button {...api.getItemProps({ value: item.value })}>
        {item.label}
      </button>
    {/each}
  </div>
</main>

<Toolbar {controls} state={_state} />
