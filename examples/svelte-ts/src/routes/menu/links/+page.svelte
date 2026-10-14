<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<div style="padding: 20px">
  <p>Use a screen reader to navigate to the menu.</p>
  <button {...api.getTriggerProps()}>
    Actions <span {...api.getIndicatorProps()}>▾</span>
  </button>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <a {...api.getItemProps({ value: "edit" })} href="https://google.com">Google</a>
      <a {...api.getItemProps({ value: "duplicate" })} href="https://bing.com">Bing</a>
      <a {...api.getItemProps({ value: "delete" })} href="https://github.com" target="_blank">GitHub</a>
      <a {...api.getItemProps({ value: "export" })} href="https://youtube.com" target="_blank">YouTube</a>
    </div>
  </div>
</div>
