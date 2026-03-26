<script lang="ts">
  import styles from "../../../../../../shared/src/css/toc.module.css"
  import * as toc from "@zag-js/toc"
  import { tocControls, tocData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"

  const controls = useControls(tocControls)

  const id = $props.id()
  const service = useMachine(
    toc.machine,
    controls.mergeProps<toc.Props>({
      id,
      items: tocData,
    }),
  )

  const api = $derived(toc.connect(service, normalizeProps))
</script>

<main class="toc">
  <div style="display: flex; gap: 2rem;">
    <nav {...api.getRootProps()} class={styles.Root}>
      <h5 {...api.getTitleProps()} class={styles.Title}>On this page</h5>
      <ul {...api.getListProps()} class={styles.List}>
        <div {...api.getIndicatorProps()} class={styles.Indicator}></div>
        {#each tocData as item}
          <li {...api.getItemProps({ item })} class={styles.Item}>
            <a href={`#${item.value}`} {...api.getLinkProps({ item })} class={styles.Link}>
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div style="max-height: 20rem; overflow: auto; flex: 1;">
      {#each tocData as item}
        <div style="margin-bottom: 1rem;">
          <h2 id={item.value} style="font-size: {item.depth === 2 ? '1.25rem' : '1rem'}">
            {item.label}
          </h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </div>
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
