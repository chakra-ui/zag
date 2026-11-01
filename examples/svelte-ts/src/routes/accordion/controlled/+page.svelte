<script lang="ts">
  import Output from "#lib/components/output.svelte"
  import * as accordion from "@zag-js/accordion"
  import { accordionFaqData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowRightIcon } from "lucide-svelte"
  import "@styles/accordion.css"

  let value = $state<string[]>(["shipping"])

  const id = $props.id()
  const service = useMachine(accordion.machine, (): accordion.Props => ({
    id,
    multiple: true,
    value,
    onValueChange: (details) => (value = details.value),
  }))

  const api = $derived(accordion.connect(service, normalizeProps))
</script>

<main class="accordion">
  <div class="accordion-layout">
    <div class="accordion-toolbar">
      <button onclick={() => (value = accordionFaqData.map((item) => item.value))}>Expand all</button>
      <button onclick={() => (value = [])}>Collapse all</button>
    </div>

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

    <Output label="value" {value} />
  </div>
</main>
