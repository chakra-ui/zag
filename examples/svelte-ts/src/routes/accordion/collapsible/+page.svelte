<script lang="ts">
  import AccordionCollapsibleContent from "$lib/components/accordion-collapsible-content.svelte"
  import * as accordion from "@zag-js/accordion"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowRightIcon } from "lucide-svelte"
  import "@styles/accordion.css"
  import "@styles/collapsible.css"

  const items = [
    {
      value: "home",
      title: "Lorem Ipsum",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Proin in nisi elementum, egestas libero sed, pretium mi.",
    },
    {
      value: "about",
      title: "Cake Ipsum",
      description:
        "Cake icing topping. I love sugar plum I love oat cake sweet. I love oat cake sweet. I love oat cake sweet.",
    },
    {
      value: "contact",
      title: "Hummingbird Ipsum",
      description:
        "The humble cupcake. Tiramisu gingerbread jujubes sugar plum. Sweet roll sweet roll I love marzipan I love fruitcake.",
    },
  ]

  const id = $props.id()
  const service = useMachine(accordion.machine, {
    id,
    multiple: true,
    defaultValue: ["home"],
  })

  const api = $derived(accordion.connect(service, normalizeProps))

  const getContentProps = (value: string) => {
    const { hidden: _, ...rest } = api.getItemContentProps({ value })
    return rest
  }
</script>

<main class="accordion">
  <div {...api.getRootProps()}>
    {#each items as item (item.value)}
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
        >
          <p>{item.description}</p>
        </AccordionCollapsibleContent>
      </div>
    {/each}
  </div>
</main>
