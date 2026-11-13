<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as radio from "@zag-js/radio-group"
  import { settingsSections } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/segmented-control.css"
  import "@styles/radio-group.css"

  const id = $props.id()
  const service = useMachine(radio.machine, {
    id,
    name: "section",
    orientation: "vertical",
    defaultValue: "profile",
  })

  const api = $derived(radio.connect(service, normalizeProps))
  const section = $derived(settingsSections.find((s) => s.id === api.value)!)
</script>

<main>
  <div class="segmented-control settings-nav">
    <p class="hint">Use the up and down arrow keys to switch sections.</p>
    <div class="layout">
      <div {...api.getRootProps()}>
        <span {...api.getLabelProps()}>Settings section</span>
        <div {...api.getIndicatorProps()}></div>
        {#each settingsSections as opt (opt.id)}
          <label {...api.getItemProps({ value: opt.id })}>
            <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
            <input {...api.getItemHiddenInputProps({ value: opt.id })} />
          </label>
        {/each}
      </div>
      <div class="panel" role="region" aria-label={section.label}>
        <p class="title">{section.label}</p>
        <p class="description">{section.description}</p>
      </div>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
