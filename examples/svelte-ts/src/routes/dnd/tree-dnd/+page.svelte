<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import * as tree from "@zag-js/tree-view"
  import styles from "@styles/dnd-tree.module.css"
  import { ChevronRightIcon, FileIcon, FolderIcon, GripVerticalIcon } from "lucide-svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/tree-view.css"

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  const initialData: Node = {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "src",
        name: "src",
        children: [
          { id: "src/app.tsx", name: "app.tsx" },
          { id: "src/index.ts", name: "index.ts" },
          {
            id: "src/components",
            name: "components",
            children: [
              { id: "src/components/button.tsx", name: "button.tsx" },
              { id: "src/components/input.tsx", name: "input.tsx" },
            ],
          },
        ],
      },
      {
        id: "public",
        name: "public",
        children: [
          { id: "public/favicon.ico", name: "favicon.ico" },
          { id: "public/logo.svg", name: "logo.svg" },
        ],
      },
      { id: "package.json", name: "package.json" },
      { id: "tsconfig.json", name: "tsconfig.json" },
      { id: "readme.md", name: "README.md" },
    ],
  }

  function createCollection(rootNode: Node) {
    return tree.collection<Node>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      rootNode,
    })
  }

  const id = $props.id()
  let collection = $state(createCollection(initialData))
  let expandedValue = $state<string[]>(["src", "public"])

  const treeService = useMachine(tree.machine, (): tree.Props => ({
    id,
    collection,
    expandedValue,
    onExpandedChange(details) {
      expandedValue = details.expandedValue
    },
  }))
  const treeApi = $derived(tree.connect(treeService, normalizeProps))

  const dndService = useMachine(dnd.machine, (): dnd.Props => ({
    id: `${id}-dnd`,
    dropPlacements: ["before", "after", "on"],
    getValueText(value) {
      return collection.stringify(value) ?? value
    },
    canDrop(source, target, placement) {
      if (source === target && placement === "on") return false
      const sourcePath = collection.getIndexPath(source)
      const targetPath = collection.getIndexPath(target)
      if (sourcePath && targetPath) {
        return !collection.contains(sourcePath, targetPath)
      }
      return true
    },
    onDrop({ source, target, placement }) {
      const sourcePath = collection.getIndexPath(source)
      const targetPath = collection.getIndexPath(target)
      if (!sourcePath || !targetPath) return

      let toPath: number[]
      switch (placement) {
        case "before":
          toPath = targetPath
          break
        case "after":
          toPath = [...targetPath.slice(0, -1), targetPath[targetPath.length - 1] + 1]
          break
        case "on":
          toPath = [...targetPath, 0]
          expandedValue = [...new Set([...expandedValue, target])]
          break
      }

      const newCollection = collection.move([sourcePath], toPath)
      collection = newCollection
    },
  }))
  const dndApi = $derived(dnd.connect(dndService, normalizeProps))
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = treeApi.getNodeState(nodeProps)}
  <div {...treeApi.getNodeGroupProps(nodeProps)}>
    <div
      {...mergeProps(treeApi.getNodeProps(nodeProps), dndApi.getDropTargetProps({ value: node.id }), {
        class: styles.dropTarget,
      })}
    >
      <div
        {...dndApi.getDropIndicatorProps({ value: node.id, placement: "before" })}
        class={styles.dropIndicator}
        style:--depth={nodeState.depth}
      ></div>

      <div {...treeApi.getNodeCellProps(nodeProps)} class={styles.cell}>
        <span {...dndApi.getDragHandleProps({ value: node.id })} class={styles.dragHandle}>
          <GripVerticalIcon size={14} />
        </span>
        {#if nodeState.isBranch}
          <span {...treeApi.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon size={14} />
          </span>
        {/if}
        {#if nodeState.isBranch}
          <FolderIcon size={14} />
        {:else}
          <FileIcon size={14} />
        {/if}
        <span {...treeApi.getNodeTextProps(nodeProps)}>{node.name}</span>
      </div>

      <div
        {...dndApi.getDropIndicatorProps({ value: node.id, placement: "after" })}
        class={styles.dropIndicator}
        style:--depth={nodeState.depth}
      ></div>
    </div>

    {#if nodeState.isBranch}
      <div {...treeApi.getNodeGroupContentProps(nodeProps)}>
        <div {...treeApi.getIndentGuideProps(nodeProps)}></div>
        {#each node.children ?? [] as childNode, index (childNode.id)}
          {@render treeNode(childNode, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class="tree-view">
  <div {...treeApi.getRootProps()}>
    <h3 {...treeApi.getLabelProps()}>File Explorer (Drag & Drop)</h3>
    <div {...dndApi.getRootProps()} class={styles.root}>
      <div {...treeApi.getTreeProps()}>
        {#each collection.rootNode.children ?? [] as node, index (node.id)}
          {@render treeNode(node, [index])}
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={dndService} />
</Toolbar>
