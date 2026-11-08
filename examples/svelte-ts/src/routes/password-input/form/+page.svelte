<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as passwordInput from "@zag-js/password-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { EyeIcon, EyeOffIcon } from "lucide-svelte"
  import "@styles/password-input.css"

  let output = $state("")

  const id = $props.id()
  const service = useMachine(passwordInput.machine, {
    id,
    name: "password",
    required: true,
    autoComplete: "new-password",
  })

  const api = $derived(passwordInput.connect(service, normalizeProps))
</script>

<main>
  <div class="password-form">
    <p class="hint">Submit empty to see the required check, then save a password.</p>
    <form
      onsubmit={(e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget))
        // never print a real password, even in a demo
        const masked = { ...data, password: `•••• (${String(data.password).length} characters)` }
        output = JSON.stringify(masked, null, 2)
      }}
      onreset={() => (output = "")}
    >
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
      <div class="actions">
        <button type="submit">Save password</button>
        <button type="reset">Reset</button>
      </div>
    </form>
    {#if output}
      <pre class="output" data-testid="form-output">{output}</pre>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
