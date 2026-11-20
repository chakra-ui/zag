<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { tocControls, tocData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toc from "@zag-js/toc"
  import "@styles/toc.css"

  const controls = useControls(tocControls)
  let scrollEl = $state<HTMLDivElement | null>(null)

  const id = $props.id()
  const service = useMachine(
    toc.machine,
    controls.mergeProps<toc.Props>({
      id,
      items: tocData,
      scrollEl: () => scrollEl,
    }),
  )

  const api = $derived(toc.connect(service, normalizeProps))
</script>

<main class="toc">
  <div
    bind:this={scrollEl}
    data-testid="scroll-container"
    style="border: 1px solid hsl(219, 1%, 72%); border-radius: 4px; height: 24rem; overflow: auto; padding: 1rem"
  >
    <div {...api.getRootProps()}>
      <nav {...api.getNavProps()} style="position: sticky; top: 0; align-self: flex-start; max-height: 8rem">
        <h5 {...api.getTitleProps()}>On this page</h5>
        <ul {...api.getListProps()}>
          <div {...api.getIndicatorProps()}></div>
          {#each tocData as item (item.value)}
            <li {...api.getItemProps({ item })}>
              <a href={`#${item.value}`} {...api.getLinkProps({ item })}>{item.label}</a>
            </li>
          {/each}
        </ul>
      </nav>

      <section style="flex: 1; min-width: 0">
        {#each tocData as item (item.value)}
          <div style="margin-bottom: 1rem">
            <h2 id={item.value} style:font-size={item.depth === 2 ? "1.25rem" : "1rem"}>{item.label}</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident.
            </p>
          </div>
        {/each}
      </section>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
