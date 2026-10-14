<script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { CheckSquareIcon, ChevronRightIcon, MinusSquareIcon, SquareIcon } from "lucide-svelte"
  import "@styles/tree-view.css"

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  const initialCollection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      children: [
        {
          id: "node_modules",
          name: "node_modules",
          children: [
            { id: "node_modules/zag-js", name: "zag-js" },
            { id: "node_modules/pandacss", name: "panda" },
            {
              id: "node_modules/@types",
              name: "@types",
              children: [
                { id: "node_modules/@types/react", name: "react" },
                { id: "node_modules/@types/react-dom", name: "react-dom" },
              ],
            },
          ],
        },
        {
          id: "src",
          name: "src",
          children: [
            { id: "src/app.tsx", name: "app.tsx" },
            { id: "src/index.ts", name: "index.ts" },
          ],
        },
        { id: "panda.config", name: "panda.config.ts" },
        { id: "package.json", name: "package.json" },
        { id: "renovate.json", name: "renovate.json" },
        { id: "readme.md", name: "README.md" },
      ],
    },
  })

  const iconMap = {
    true: CheckSquareIcon,
    false: SquareIcon,
    indeterminate: MinusSquareIcon,
  }

  const id = $props.id()
  const service = useMachine(tree.machine as tree.Machine<Node>, {
    id,
    collection: initialCollection,
    defaultCheckedValue: [],
  })

  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  {@const Icon = iconMap[nodeState.checked.toString() as keyof typeof iconMap]}
  <div {...api.getNodeGroupProps(nodeProps)}>
    <div {...api.getNodeProps(nodeProps)}>
      <div {...api.getNodeCellProps(nodeProps)}>
        {#if nodeState.isBranch}
          <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon />
          </span>
        {/if}
        <span {...api.getNodeCheckboxProps(nodeProps)}>
          <Icon />
        </span>
      </div>
      <div {...api.getNodeCellProps(nodeProps)}>
        <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
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
    <h3 {...api.getLabelProps()}>My Documents</h3>
    <div {...api.getTreeProps()}>
      {#each api.collection.rootNode.children ?? [] as node, index (node.id)}
        {@render treeNode(node, [index])}
      {/each}
    </div>
  </div>
  <pre>{JSON.stringify(api.checkedValue, null, 2)}</pre>
</main>
