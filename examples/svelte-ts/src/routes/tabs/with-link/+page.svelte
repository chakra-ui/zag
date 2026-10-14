<script lang="ts">
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { tabsData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"
  import "@styles/tabs.css"

  const query = $derived({
    controlled: page.url.searchParams.has("controlled"),
    automatic: page.url.searchParams.has("automatic"),
    native: page.url.searchParams.has("native"),
    cancel: page.url.searchParams.has("cancel"),
  })

  let value = $state<string | null>("nils")

  const id = $props.id()
  const service = useMachine(tabs.machine, () => ({
    id,
    defaultValue: "nils",
    value: query.controlled ? value : undefined,
    onValueChange(details: tabs.ValueChangeDetails) {
      value = details.value
    },
    activationMode: query.automatic ? ("automatic" as const) : ("manual" as const),
    ...(!query.native && {
      navigate(details: tabs.NavigateDetails) {
        goto(`#${details.value}`)
      },
    }),
  }))

  const api = $derived(tabs.connect(service, normalizeProps))
</script>

<main class="tabs" data-ready={!service.context.get("ssr")}>
  <div>
    <button onclick={() => api.setValue("agnes")}>Select Agnes with API</button>
    <button onclick={() => (value = "joke")}>Select Joke with prop</button>
  </div>
  <p>
    Selected: <output data-testid="value">{api.value ?? "none"}</output>
  </p>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    {...api.getRootProps()}
    onclick={(event) => {
      if (query.cancel) event.preventDefault()
    }}
  >
    <div {...api.getIndicatorProps()}></div>
    <div {...api.getListProps()}>
      {#each tabsData as data}
        <a href={`#${data.id}`} {...api.getTriggerProps({ value: data.id }) as any}>
          {data.label}
        </a>
      {/each}
    </div>
    {#each tabsData as data}
      <div {...api.getContentProps({ value: data.id })}>
        <p>{data.content}</p>
        {#if data.id === "agnes"}
          <input placeholder="Agnes" />
        {/if}
      </div>
    {/each}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
