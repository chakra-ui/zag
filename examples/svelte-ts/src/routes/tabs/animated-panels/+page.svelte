<script lang="ts">
  import Presence from "#lib/components/presence.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"
  import "@styles/tabs.css"

  const items = [
    { value: "overview", label: "Overview", content: "Workspace stats and activity." },
    { value: "projects", label: "Projects", content: "Milestones and deadlines." },
    { value: "account", label: "Account", content: "Profile and preferences." },
  ]

  const id = $props.id()
  const service = useMachine(tabs.machine, {
    id,
    defaultValue: "overview",
  })

  const api = $derived(tabs.connect(service, normalizeProps))
</script>

<main class="tabs">
  <div {...api.getRootProps()} class="animated-tabs">
    <div {...api.getListProps()}>
      {#each items as item (item.value)}
        <button {...api.getTriggerProps({ value: item.value })}>{item.label}</button>
      {/each}
      <div {...api.getIndicatorProps()}></div>
    </div>
    <div class="animated-tabs__viewport">
      {#each items as item (item.value)}
        <Presence {...api.getContentProps({ value: item.value })} skipAnimationOnMount>
          <p>{item.content}</p>
        </Presence>
      {/each}
    </div>
  </div>
</main>
