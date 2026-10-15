<script lang="ts" module>
  export interface AccordionTreeItem {
    value: string
    title: string
    content?: string
    children?: AccordionTreeItem[]
  }
</script>

<script lang="ts">
  import * as accordion from "@zag-js/accordion"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowRightIcon } from "lucide-svelte"
  import AccordionTree from "./accordion-tree.svelte"

  const { items }: { items: AccordionTreeItem[] } = $props()

  // Each level is its own machine, so arrow keys only move within one level
  const id = $props.id()
  const service = useMachine(accordion.machine, { id, multiple: true })
  const api = $derived(accordion.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  {#each items as item (item.value)}
    <div {...api.getItemProps({ value: item.value })}>
      <h3 {...api.getItemHeaderProps({ value: item.value })}>
        <button {...api.getItemTriggerProps({ value: item.value })}>
          {item.title}
          <span {...api.getItemIndicatorProps({ value: item.value })}><ArrowRightIcon /></span>
        </button>
      </h3>
      <div {...api.getItemContentProps({ value: item.value })}>
        <div class="accordion-item-body">
          {item.content ?? ""}
          {#if item.children}
            <AccordionTree items={item.children} />
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
