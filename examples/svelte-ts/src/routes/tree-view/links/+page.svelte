<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { treeviewControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { ChevronRightIcon, ExternalLinkIcon, FileIcon, FolderIcon } from "lucide-svelte"
  import "@styles/tree-view.css"

  interface Node {
    id: string
    name: string
    href?: string
    children?: Node[]
  }

  const collection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      children: [
        {
          id: "docs",
          name: "Documentation",
          children: [
            { id: "docs/getting-started", name: "Getting Started", href: "/docs/getting-started" },
            { id: "docs/installation", name: "Installation", href: "/docs/installation" },
            {
              id: "docs/components",
              name: "Components",
              children: [
                { id: "docs/components/accordion", name: "Accordion", href: "/docs/components/accordion" },
                { id: "docs/components/dialog", name: "Dialog", href: "/docs/components/dialog" },
                { id: "docs/components/menu", name: "Menu", href: "/docs/components/menu" },
              ],
            },
          ],
        },
        {
          id: "examples",
          name: "Examples",
          children: [
            { id: "examples/react", name: "React Examples", href: "/examples/react" },
            { id: "examples/vue", name: "Vue Examples", href: "/examples/vue" },
            { id: "examples/solid", name: "Solid Examples", href: "/examples/solid" },
          ],
        },
        {
          id: "external",
          name: "External Links",
          children: [
            { id: "external/github", name: "GitHub Repository", href: "https://github.com/chakra-ui/zag" },
            { id: "external/npm", name: "NPM Package", href: "https://www.npmjs.com/package/@zag-js/core" },
            { id: "external/docs", name: "Official Docs", href: "https://zagjs.com" },
          ],
        },
        { id: "readme.md", name: "README.md", href: "/readme" },
        { id: "license", name: "LICENSE", href: "/license" },
      ],
    },
  })

  const controls = useControls(treeviewControls)

  const id = $props.id()
  const service = useMachine(
    tree.machine,
    controls.mergeProps<tree.Props>({
      id,
      collection,
    }),
  )
  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  <div {...api.getNodeGroupProps(nodeProps)}>
    <div {...api.getNodeProps(nodeProps)}>
      <div {...api.getNodeCellProps(nodeProps)}>
        {#if nodeState.isBranch}
          <FolderIcon />
        {:else}
          <FileIcon />
        {/if}
        <span {...api.getNodeTextProps(nodeProps)}>
          {#if node.href}
            <a href={node.href}>
              {node.name}
              {#if node.href.startsWith("http")}
                <ExternalLinkIcon size={12} />
              {/if}
            </a>
          {:else}
            {node.name}
          {/if}
        </span>
        {#if nodeState.isBranch}
          <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon />
          </span>
        {/if}
      </div>
    </div>
    {#if nodeState.isBranch}
      <div {...api.getNodeGroupContentProps(nodeProps)}>
        <div {...api.getIndentGuideProps(nodeProps)}></div>
        {#each node.children ?? [] as childNode, index (childNode.id)}
          {@render treeNode(childNode, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class="tree-view">
  <div {...api.getRootProps()}>
    <h3 {...api.getLabelProps()}>Docs</h3>
    <div {...api.getTreeProps()}>
      {#each collection.rootNode.children ?? [] as node, index (node.id)}
        {@render treeNode(node, [index])}
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
