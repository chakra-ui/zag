<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  const backupCodes = ["7F3K-92QD", "M4XP-6TBR", "Q8WN-1JZC", "H2VL-5RYE"]

  let password = $state("")
  let code = $state("")
  let verifying = $state(false)
  let verified = $state(false)

  // Once verified, 2FA is on: the earlier steps can no longer be revisited
  const items = $derived<steps.StepItem[]>([
    { value: "password", title: "Confirm password", invalid: !password, editable: !verified },
    { value: "scan", title: "Scan QR code", editable: !verified },
    { value: "verify", title: "Enter code", invalid: !/^\d{6}$/.test(code), editable: !verified },
  ])

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
    linear: true,
  }))

  const api = $derived(steps.connect(service, normalizeProps))

  const verify = async () => {
    verifying = true
    await new Promise((resolve) => setTimeout(resolve, 600))
    verifying = false
    verified = true
    api.goToNextStep()
  }

  const cancel = () => {
    password = ""
    code = ""
    verified = false
    api.resetStep()
  }
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    <h2>Enable two-factor authentication</h2>

    <div {...api.getListProps()}>
      {#each api.items as item, index (item.value)}
        <div {...api.getItemProps({ value: item.value })}>
          <button {...api.getTriggerProps({ value: item.value })}>
            <div {...api.getIndicatorProps({ value: item.value })}>{index + 1}</div>
            <span>{item.title}</span>
          </button>
          <div {...api.getSeparatorProps({ value: item.value })}></div>
        </div>
      {/each}
    </div>

    <div {...api.getContentProps({ value: "password" })} class="steps-form">
      <label>
        Password
        <input type="password" bind:value={password} />
      </label>
    </div>

    <div {...api.getContentProps({ value: "scan" })}>
      <p>Scan this code with your authenticator app, or enter the key manually.</p>
      <code>JBSW Y3DP EHPK 3PXP</code>
    </div>

    <div {...api.getContentProps({ value: "verify" })} class="steps-form">
      <label>
        6-digit code
        <input inputmode="numeric" maxlength={6} bind:value={code} />
      </label>
    </div>

    <div {...api.getContentProps({ value: steps.COMPLETE })}>
      <p>Two-factor authentication is on. Save these backup codes:</p>
      <ul>
        {#each backupCodes as backupCode (backupCode)}
          <li>
            <code>{backupCode}</code>
          </li>
        {/each}
      </ul>
    </div>

    <div class="steps-actions">
      {#if api.complete}
        <button {...api.getPreviousTriggerProps()}>Back</button>
      {:else}
        <button onclick={cancel}>Cancel</button>
        <button {...api.getPreviousTriggerProps()}>Back</button>
        {#if api.value === "verify"}
          <button onclick={verify} disabled={verifying || api.item?.invalid}>
            {verifying ? "Verifying…" : "Verify"}
          </button>
        {:else}
          <button {...api.getNextTriggerProps()}>Continue</button>
        {/if}
      {/if}
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
