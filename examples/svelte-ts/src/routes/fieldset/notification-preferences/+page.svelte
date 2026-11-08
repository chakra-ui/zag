<script lang="ts">
  import * as fieldsetMachine from "@zag-js/fieldset"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/field.css"
  import "@styles/fieldset.css"

  const channels = ["Order updates", "Price drops", "Weekly newsletter"]
  let selected = $state<string[]>(["Order updates"])

  const id = $props.id()
  const service = useMachine(fieldsetMachine.machine, { id })
  const api = $derived(fieldsetMachine.connect(service, normalizeProps))
</script>

<main>
  <div class="field-page notification-preferences">
    <form onsubmit={(e) => e.preventDefault()}>
      <fieldset {...api.getRootProps()}>
        <legend {...api.getLegendProps()}>Email notifications</legend>
        <span {...api.getHelperTextProps()}>Choose which emails you would like to receive.</span>
        {#each channels as channel (channel)}
          <label class="choice">
            <input type="checkbox" name="notifications" value={channel} bind:group={selected} />
            {channel}
          </label>
        {/each}
      </fieldset>
      <div class="actions">
        <button type="button" onclick={() => (selected = ["Order updates"])}>Reset</button>
      </div>
    </form>
    <p class="summary" role="status" data-testid="summary">
      {selected.length ? `Subscribed to: ${selected.join(", ")}` : "No emails selected"}
    </p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
