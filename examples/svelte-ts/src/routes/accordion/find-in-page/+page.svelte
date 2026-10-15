<script lang="ts">
  import * as accordion from "@zag-js/accordion"
  import { accordionFaqData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowRightIcon } from "lucide-svelte"
  import "@styles/accordion.css"

  const id = $props.id()
  const service = useMachine(accordion.machine, { id, hiddenUntilFound: true })
  const api = $derived(accordion.connect(service, normalizeProps))
</script>

<main class="accordion">
  <div class="accordion-layout">
    <p class="accordion-hint">Search the page for “refund” or “invoices” to open the matching answer.</p>
    <div {...api.getRootProps()}>
      {#each accordionFaqData as item (item.value)}
        <div {...api.getItemProps({ value: item.value })}>
          <h3 {...api.getItemHeaderProps({ value: item.value })}>
            <button {...api.getItemTriggerProps({ value: item.value })}>
              {item.title}
              <span {...api.getItemIndicatorProps({ value: item.value })}><ArrowRightIcon /></span>
            </button>
          </h3>
          <div {...api.getItemContentProps({ value: item.value })}>
            <div class="accordion-item-body">{item.content}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</main>
