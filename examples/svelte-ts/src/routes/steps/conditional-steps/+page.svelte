<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  type Usage = "solo" | "team"

  let name = $state("")
  let usage = $state<Usage>("team")

  const items = $derived<steps.StepItem[]>([
    { value: "profile", title: "Profile", invalid: !name.trim() },
    { value: "usage", title: "Usage" },
    // Only teams invite people, so solo users never see this step
    { value: "invite", title: "Invite team", optional: true, disabled: usage === "solo" },
    { value: "calendar", title: "Connect calendar", optional: true },
  ])

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
  }))

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    <p>{api.complete ? "All set" : `Step ${api.index + 1} of ${api.count}`}</p>
    <div {...api.getProgressProps()}>
      <div class="steps-progress-fill"></div>
    </div>

    <div {...api.getListProps()}>
      {#each api.items as item, index (item.value)}
        {@const itemState = api.getItemState({ value: item.value })}
        <div {...api.getItemProps({ value: item.value })}>
          <button {...api.getTriggerProps({ value: item.value })}>
            <div {...api.getIndicatorProps({ value: item.value })}>
              {itemState.completed ? "✓" : itemState.skipped ? "–" : index + 1}
            </div>
            <span>{item.title}</span>
          </button>
          <div {...api.getSeparatorProps({ value: item.value })}></div>
        </div>
      {/each}
    </div>

    <div {...api.getContentProps({ value: "profile" })} class="steps-form">
      <label>
        Your name
        <input bind:value={name} />
      </label>
    </div>

    <div {...api.getContentProps({ value: "usage" })} class="steps-form">
      {#each ["solo", "team"] as const as option (option)}
        <label style="flex-direction: row">
          <input type="radio" name="usage" checked={usage === option} onchange={() => (usage = option)} />
          {option === "solo" ? "Just me" : "With my team"}
        </label>
      {/each}
    </div>

    <div {...api.getContentProps({ value: "invite" })} class="steps-form">
      <label>
        Teammate emails
        <textarea placeholder="ada@example.com, alan@example.com"></textarea>
      </label>
    </div>

    <div {...api.getContentProps({ value: "calendar" })}>
      <p>Sync your calendar to see meetings next to your tasks.</p>
      <button>Connect Google Calendar</button>
    </div>

    <div {...api.getContentProps({ value: steps.COMPLETE })}>
      <p>Welcome aboard, {name}!</p>
      <button onclick={() => api.resetStep()}>Start over</button>
    </div>

    {#if !api.complete}
      <div class="steps-actions">
        <button {...api.getPreviousTriggerProps()}>Back</button>
        <button {...api.getSkipTriggerProps()}>Do it later</button>
        <button {...api.getNextTriggerProps()}>{api.canComplete ? "Finish" : "Continue"}</button>
      </div>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
