<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as zagSwitch from "@zag-js/switch"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/switch.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const switchService = useMachine(zagSwitch.machine, { id: `${id}-switch`, disabled: true })
  const switchApi = $derived(zagSwitch.connect(switchService, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, { id: `${id}-tooltip` })
  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
</script>

<main class="switch">
  <!-- Switch props last, so its id and data-state win -->
  <label {...mergeProps(tooltipApi.getTriggerProps(), switchApi.getRootProps())}>
    <input {...switchApi.getHiddenInputProps()} />
    <span {...switchApi.getControlProps()}>
      <span {...switchApi.getThumbProps()}></span>
    </span>
    <span {...switchApi.getLabelProps()}>Wi-Fi</span>
  </label>

  <Portal>
    <div {...tooltipApi.getPositionerProps()}>
      <Presence class="tooltip-content" {...tooltipApi.getContentProps()}
        >Wi-Fi is managed by your organization</Presence
      >
    </div>
  </Portal>
</main>
