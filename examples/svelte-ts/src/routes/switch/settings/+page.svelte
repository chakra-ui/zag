<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as zagSwitch from "@zag-js/switch"
  import "@styles/switch.css"

  const id = $props.id()
  let lowPower = $state(false)

  function useSetting(suffix: string, label: string, testId: string, props: () => Omit<zagSwitch.Props, "id">) {
    const service = useMachine(zagSwitch.machine, () => ({ ...props(), id: `${id}-${suffix}` }))
    return { label, testId, service }
  }

  const power = useSetting("power", "Low power mode", "switch-low-power", () => ({
    onCheckedChange: (details) => (lowPower = details.checked),
  }))
  const rows = [
    power,
    useSetting("background", "Background refresh", "switch-background", () => ({
      defaultChecked: true,
      disabled: lowPower,
    })),
    useSetting("location", "Location services", "switch-location", () => ({
      defaultChecked: true,
      disabled: lowPower,
    })),
  ]
</script>

<main>
  <div class="switch-settings">
    <p class="hint">Turn on Low power mode to pause the other two.</p>
    <div class="rows">
      {#each rows as row (row.testId)}
        {@const api = zagSwitch.connect(row.service, normalizeProps)}
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label data-testid={row.testId} {...api.getRootProps()}>
          <input {...api.getHiddenInputProps()} />
          <span {...api.getControlProps()}>
            <span {...api.getThumbProps()}></span>
          </span>
          <span {...api.getLabelProps()}>{row.label}</span>
        </label>
      {/each}
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={power.service} />
</Toolbar>
