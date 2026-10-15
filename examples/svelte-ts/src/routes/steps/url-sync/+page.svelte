<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  // Keep the URL readable instead of exposing `steps.COMPLETE`
  const toSlug = (value: string | null) => (value === steps.COMPLETE ? "confirmation" : (value ?? "contact"))
  const fromSlug = (slug: string | null) => (slug === "confirmation" ? steps.COMPLETE : (slug ?? "contact"))

  let email = $state("")
  let address = $state("")
  let digitalOnly = $state(false)

  const items = $derived<steps.StepItem[]>([
    { value: "contact", title: "Contact", invalid: !email.includes("@") },
    // Digital goods need no shipping
    { value: "shipping", title: "Shipping", invalid: !address.trim(), disabled: digitalOnly },
    { value: "payment", title: "Payment" },
  ])

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
    linear: true,
    // The URL is the source of truth, so browser Back/Forward moves between steps
    value: fromSlug(page.url.searchParams.get("step")),
    onValueChange({ value }) {
      goto(`${page.url.pathname}?step=${toSlug(value)}`, { keepFocus: true, noScroll: true })
    },
  }))

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
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

    <div {...api.getContentProps({ value: "contact" })} class="steps-form">
      <label>
        Email
        <input type="email" bind:value={email} />
      </label>
      <label style="flex-direction: row">
        <input type="checkbox" bind:checked={digitalOnly} />
        My cart only has digital items
      </label>
    </div>

    <div {...api.getContentProps({ value: "shipping" })} class="steps-form">
      <label>
        Address
        <input bind:value={address} />
      </label>
    </div>

    <div {...api.getContentProps({ value: "payment" })}>
      <p>Card ending in 4242</p>
    </div>

    <div {...api.getContentProps({ value: steps.COMPLETE })}>
      <p>Order placed. A receipt is on its way to {email}.</p>
    </div>

    {#if !api.complete}
      <div class="steps-actions">
        <button {...api.getPreviousTriggerProps()}>Back</button>
        <button {...api.getNextTriggerProps()}>{api.canComplete ? "Place order" : "Continue"}</button>
      </div>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
