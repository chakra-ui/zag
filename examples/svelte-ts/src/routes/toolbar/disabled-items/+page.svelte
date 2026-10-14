<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ControlsPanel from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  let log = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))

  function onActivate(label: string) {
    log = [...log, label].slice(-5)
  }
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })} onclick={() => onActivate("Cut")}>Cut</button>

    <button
      {...api.getItemProps({ value: "copy", disabled: true, focusableWhenDisabled: false })}
      onclick={() => onActivate("Copy")}
    >
      Copy (disabled, skipped by arrow keys)
    </button>

    <button
      {...api.getItemProps({ value: "paste", disabled: true })}
      onclick={() => {
        if (api.getItemState({ value: "paste", disabled: true }).disabled) return
        onActivate("Paste")
      }}
    >
      Paste (disabled, still reachable)
    </button>

    <button {...api.getItemProps({ value: "select-all" })} onclick={() => onActivate("Select All")}>Select All</button>
  </div>
  <p>Activated: {log.join(", ") || "(none)"}</p>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>
