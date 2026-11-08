<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as passwordInput from "@zag-js/password-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { EyeIcon, EyeOffIcon } from "lucide-svelte"
  import "@styles/password-input.css"

  let visible = $state(false)
  let password = $state("")
  let confirm = $state("")

  const bothFilled = $derived(password.length > 0 && confirm.length > 0)
  const matches = $derived(password === confirm)
  const status = $derived(!bothFilled ? "Enter both passwords" : matches ? "Passwords match" : "Passwords don't match")

  const id = $props.id()
  const passwordService = useMachine(passwordInput.machine, () => ({
    id: `${id}-password`,
    autoComplete: "new-password" as const,
    visible,
    onVisibilityChange: (details: { visible: boolean }) => {
      visible = details.visible
    },
  }))
  const passwordApi = $derived(passwordInput.connect(passwordService, normalizeProps))

  const confirmService = useMachine(passwordInput.machine, () => ({
    id: `${id}-confirm`,
    autoComplete: "new-password" as const,
    visible,
    onVisibilityChange: (details: { visible: boolean }) => {
      visible = details.visible
    },
    invalid: bothFilled && !matches,
    translations: { visibilityTrigger: (v: boolean) => (v ? "Hide confirmation" : "Show confirmation") },
  }))
  const confirmApi = $derived(passwordInput.connect(confirmService, normalizeProps))
</script>

<main>
  <div class="password-confirm">
    <p class="hint">Show either password and both fields reveal together.</p>
    <div {...passwordApi.getRootProps()}>
      <label {...passwordApi.getLabelProps()}>New password</label>
      <div {...passwordApi.getControlProps()}>
        <input {...passwordApi.getInputProps()} oninput={(e) => (password = e.currentTarget.value)} />
        <button {...passwordApi.getVisibilityTriggerProps()}>
          <span {...passwordApi.getIndicatorProps()}>
            {#if passwordApi.visible}
              <EyeIcon />
            {:else}
              <EyeOffIcon />
            {/if}
          </span>
        </button>
      </div>
    </div>
    <div {...confirmApi.getRootProps()}>
      <label {...confirmApi.getLabelProps()}>Confirm password</label>
      <div {...confirmApi.getControlProps()}>
        <input {...confirmApi.getInputProps()} oninput={(e) => (confirm = e.currentTarget.value)} />
        <button {...confirmApi.getVisibilityTriggerProps()}>
          <span {...confirmApi.getIndicatorProps()}>
            {#if confirmApi.visible}
              <EyeIcon />
            {:else}
              <EyeOffIcon />
            {/if}
          </span>
        </button>
      </div>
    </div>
    <p class="match" role="status">{status}</p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={passwordService} />
  <StateVisualizer state={confirmService} />
</Toolbar>
