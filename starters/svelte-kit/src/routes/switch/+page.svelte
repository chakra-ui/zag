<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as zagSwitch from "@zag-js/switch"

  const service = useMachine(zagSwitch.machine, () => ({
    id: "switch-1",
    name: "switch",
  }))

  const api = $derived(zagSwitch.connect(service, normalizeProps))
</script>

<h1>Switch Bug Reproduction</h1>

<p>
  <strong>Steps to reproduce:</strong>
</p>
<ol>
  <li>Toggle the switch below</li>
  <li>Click "Settings Page" link or press browser back</li>
  <li>Check console for <code>state_unsafe_mutation</code> error</li>
</ol>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label {...api.getRootProps()} style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
  <input {...api.getHiddenInputProps()} />
  <span
    {...api.getControlProps()}
    style="
      display: inline-flex;
      align-items: center;
      width: 40px;
      height: 24px;
      padding: 2px;
      border-radius: 12px;
      background: {api.checked ? '#3b82f6' : '#ccc'};
      cursor: pointer;
      transition: background 0.2s;
    "
  >
    <span
      {...api.getThumbProps()}
      style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        transition: transform 0.2s;
        transform: {api.checked ? 'translateX(16px)' : 'translateX(0)'};
      "
    ></span>
  </span>
  <span {...api.getLabelProps()}>Feature is {api.checked ? "enabled" : "disabled"}</span>
</label>

<p style="margin-top: 16px; color: #666;">
  Switch state: <strong>{api.checked ? "ON" : "OFF"}</strong>
</p>
