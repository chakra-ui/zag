<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import type { TreeCollection } from "@zag-js/collection"
  import {
    type JsonNode,
    type JsonNodeHastElement,
    getAccessibleDescription,
    getPreviewOptions,
    getRootNode,
    jsonNodeToElement,
    keyPathToKey,
    nodeToString,
    nodeToValue,
  } from "@zag-js/json-tree-utils"
  import { jsonTreeData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import styles from "@styles/json-tree-view.module.css"
  import { ChevronRightIcon } from "lucide-svelte"

  const DEFAULT_EXPANDED_DEPTH = 2

  const previewOptions = getPreviewOptions()

  function getBranchValues(collection: TreeCollection<JsonNode>, depth: number) {
    const values: string[] = []
    collection.visit({
      onEnter: (node, indexPath) => {
        if (indexPath.length === 0) return
        if (collection.isBranchNode(node) && indexPath.length <= depth) {
          values.push(collection.getNodeValue(node))
        }
      },
    })
    return values
  }

  const collection = tree.collection<JsonNode>({
    nodeToValue,
    nodeToString,
    rootNode: getRootNode(jsonTreeData, previewOptions),
  })

  const defaultExpandedValue = getBranchValues(collection, DEFAULT_EXPANDED_DEPTH)

  const id = $props.id()
  const service = useMachine(tree.machine, {
    id,
    collection,
    defaultExpandedValue,
    typeahead: false,
  })

  const api = $derived(tree.connect(service, normalizeProps))

  function getContentProps(node: JsonNode, depth: number) {
    return {
      "aria-label": getAccessibleDescription(node),
      class: styles.node,
      style: `--depth: ${depth}`,
    }
  }
</script>

{#snippet keyNode(node: JsonNode)}
  <span data-kind="key" data-non-enumerable={node.isNonEnumerable ? "" : undefined}
    >{keyPathToKey(node.keyPath, { excludeRoot: true })}</span
  ><span data-kind="colon">: </span>
{/snippet}

{#snippet valueNode(node: JsonNodeHastElement)}
  {#if node.type === "text"}{node.value}{:else}<svelte:element
      this={node.tagName}
      data-root={node.properties.root ? "" : undefined}
      data-type={node.properties.nodeType}
      data-kind={node.properties.kind}
      >{#each node.children as child, index (index)}{@render valueNode(child)}{/each}</svelte:element
    >{/if}
{/snippet}

{#snippet jsonTreeNode(node: JsonNode, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  {@const key = keyPathToKey(node.keyPath, { excludeRoot: true })}
  {@const value = jsonNodeToElement(node, previewOptions)}
  <div {...api.getNodeGroupProps(nodeProps)} class={styles.nodeGroup}>
    <div {...mergeProps(api.getNodeProps(nodeProps), getContentProps(node, nodeState.depth))}>
      <div {...api.getNodeCellProps(nodeProps)} class={styles.cell}>
        {#if nodeState.isBranch}
          <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} class={styles.chevron}>
            <ChevronRightIcon size={14} />
          </span>
        {:else}
          <span class={styles.chevronSpacer} aria-hidden="true"></span>
        {/if}
        {#if key}
          {@render keyNode(node)}
        {/if}
        {@render valueNode(value)}
      </div>
    </div>
    {#if nodeState.isBranch}
      <div {...api.getNodeGroupContentProps(nodeProps)} class={styles.groupContent}>
        <div {...api.getIndentGuideProps(nodeProps)} class={styles.indentGuide}></div>
        {#each node.children ?? [] as child, index (nodeToValue(child))}
          {@render jsonTreeNode(child, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main class={styles.root}>
  <div {...api.getRootProps()}>
    <div class={styles.header}>
      <h3 {...api.getLabelProps()}>JSON Tree</h3>
      <p>
        Tree view wired to <code>@zag-js/json-tree-utils</code> for parsing, previews, and accessible labels.
      </p>
    </div>

    <div class={styles.toolbar}>
      <button type="button" class={styles.button} onclick={() => api.collapse()}>Collapse all</button>
      <button type="button" class={styles.button} onclick={() => api.expand()}>Expand all</button>
    </div>

    <div class={styles.panel}>
      <div class={styles.viewport}>
        <div {...api.getTreeProps()} class={styles.tree}>
          {#each collection.rootNode.children ?? [] as node, index (nodeToValue(node))}
            {@render jsonTreeNode(node, [index])}
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
