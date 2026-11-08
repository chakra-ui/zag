<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as passwordInput from "@zag-js/password-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { EyeIcon, EyeOffIcon } from "lucide-svelte"
  import "@styles/password-input.css"

  let value = $state("")

  const rules = $derived([
    { id: "length", label: "At least 8 characters", met: value.length >= 8 },
    { id: "number", label: "Contains a number", met: /\d/.test(value) },
  ])
  const invalid = $derived(value.length > 0 && rules.some((rule) => !rule.met))

  const id = $props.id()
  const service = useMachine(passwordInput.machine, () => ({
    id,
    autoComplete: "new-password" as const,
    invalid,
  }))

  const api = $derived(passwordInput.connect(service, normalizeProps))
</script>

<main>
  <div class="password-sign-up">
    <p class="hint">Type a password to see which rules it still needs to meet.</p>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Password</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} oninput={(e) => (value = e.currentTarget.value)} />
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
    <ul class="rules">
      {#each rules as rule (rule.id)}
        <li data-testid="rule-{rule.id}" data-met={rule.met}>
          {rule.label} ({rule.met ? "met" : "not met"})
        </li>
      {/each}
    </ul>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
