<script lang="ts">
  import AccordionTree, { type AccordionTreeItem } from "$lib/components/accordion-tree.svelte"
  import "@styles/accordion.css"

  const sections: AccordionTreeItem[] = [
    {
      value: "getting-started",
      title: "Getting started",
      children: [
        {
          value: "installation",
          title: "Installation",
          content: "Install the machine and the adapter for your framework.",
        },
        {
          value: "usage",
          title: "Usage",
          content: "Create a service with useMachine, then connect it to get the API.",
        },
      ],
    },
    {
      value: "styling",
      title: "Styling",
      children: [
        {
          value: "data-attributes",
          title: "Data attributes",
          content: "Every part exposes data-state for open styles.",
        },
        { value: "animation", title: "Animation", content: "Compose with collapsible to animate the content height." },
      ],
    },
    { value: "faq", title: "FAQ", content: "Each accordion keeps its own value, focus, and keyboard handling." },
  ]
</script>

<main class="accordion">
  <div class="accordion-layout">
    <AccordionTree items={sections} />
  </div>
</main>
