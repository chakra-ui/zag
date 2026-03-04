<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as passwordInput from "@zag-js/password-input"
  import { passwordInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { EyeIcon, EyeOffIcon } from "lucide-svelte"

  const controls = useControls(passwordInputControls)

  const id = $props.id()
  const service = useMachine(passwordInput.machine, controls.mergeProps<passwordInput.Props>({ id }))

  const api = $derived(passwordInput.connect(service, normalizeProps))
</script>

<main class="password-input">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Password</label>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps()} />
      <button {...api.getVisibilityTriggerProps()}>
        <span {...api.getIndicatorProps()}>
          {#if api.visible}
            <EyeIcon />
          {:else}
            <EyeOffIcon />
          {/if}
        </span>
      </button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
