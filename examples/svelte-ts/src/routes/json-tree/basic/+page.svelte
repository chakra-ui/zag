<script lang="ts">
  import {
    type JsonNode,
    type JsonNodeHastElement,
    getAccessibleDescription,
    isRootKeyPath,
    jsonNodeToElement,
    jsonToTree,
    keyPathToId,
    keyPathToKey,
  } from "@zag-js/json-tree-utils"
  import { jsonTreeData } from "@zag-js/shared"

  const treeData = jsonToTree(jsonTreeData)
</script>

{#snippet KeyNode(node: JsonNode)}
  <span data-kind="key" data-non-enumerable={node.isNonEnumerable ? "" : undefined}>
    {keyPathToKey(node.keyPath, { excludeRoot: true })}
  </span>
  <span data-kind="colon">: </span>
{/snippet}

{#snippet ValueNode(node: JsonNodeHastElement)}
  {#if node.type === "text"}
    {node.value}
  {:else}
    <svelte:element
      this={node.tagName}
      data-root={node.properties.root ? "" : undefined}
      data-type={node.properties.nodeType}
      data-kind={node.properties.kind}
    >
      {#each node.children as child, index (index)}
        {@render ValueNode(child)}
      {/each}
    </svelte:element>
  {/if}
{/snippet}

{#snippet JsonTreeNode(node: JsonNode, indexPath: number[])}
  {@const line = indexPath.reduce((acc, curr) => acc + curr, 1)}
  {@const lineLength = indexPath.length - 1}
  {@const key = isRootKeyPath(node.keyPath) ? "" : keyPathToKey(node.keyPath)}

  {#if node.children && node.children.length > 0}
    <div>
      <div aria-label={getAccessibleDescription(node)} data-key={node.keyPath.join(".")}>
        {#if key}
          {@render KeyNode(node)}
        {/if}
        {@render ValueNode(jsonNodeToElement(node))}
      </div>
      <div style="padding-left: {indexPath.length * 4}px">
        {#each node.children as child, index (keyPathToId(child.keyPath))}
          {@render JsonTreeNode(child, [...indexPath, index])}
        {/each}
      </div>
    </div>
  {:else}
    <div
      aria-label={getAccessibleDescription(node)}
      data-line={line}
      data-key={node.keyPath.join(".")}
      style="--line-length: {lineLength}"
    >
      {#if key}
        {@render KeyNode(node)}
      {/if}
      {@render ValueNode(jsonNodeToElement(node))}
    </div>
  {/if}
{/snippet}

<main style="font-family: monospace">
  {@render JsonTreeNode(treeData, [0])}
</main>

<style>
  main :global(*) {
    font-family: monospace;
    font-size: 12px;
  }

  main :global([data-kind="error-stack"]) {
    display: block;
  }
</style>
