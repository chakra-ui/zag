<script lang="ts">
  import AccordionCollapsibleContent from "#lib/components/accordion-collapsible-content.svelte"
  import * as accordion from "@zag-js/accordion"
  import { accordionFaqData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowRightIcon } from "lucide-svelte"
  import "@styles/accordion.css"
  import "@styles/collapsible.css"

  const id = $props.id()
  const service = useMachine(accordion.machine, {
    id,
    multiple: true,
    defaultValue: ["shipping"],
  })

  const api = $derived(accordion.connect(service, normalizeProps))

  const getContentProps = (value: string) => {
    const { hidden: _, ...rest } = api.getItemContentProps({ value })
    return rest
  }
</script>

<main class="accordion">
  <div class="accordion-layout">
    <p class="accordion-hint">Search the page for “invoices” to open the matching answer.</p>
    <div {...api.getRootProps()}>
      {#each accordionFaqData as item (item.value)}
        <div {...api.getItemProps({ value: item.value })}>
          <h3 {...api.getItemHeaderProps({ value: item.value })}>
            <button {...api.getItemTriggerProps({ value: item.value })}>
              {item.title}
              <div {...api.getItemIndicatorProps({ value: item.value })}>
                <ArrowRightIcon />
              </div>
            </button>
          </h3>
          <AccordionCollapsibleContent
            {...getContentProps(item.value)}
            open={api.getItemState({ value: item.value }).expanded}
            onOpenChange={(open) =>
              api.setValue(open ? [...api.value, item.value] : api.value.filter((v) => v !== item.value))}
          >
            <p class="accordion-item-body">{item.content}</p>
          </AccordionCollapsibleContent>
        </div>
      {/each}
    </div>
  </div>
</main>
