<script lang="ts">
  import {
    type JsonNode,
    type JsonNodeHastElement,
    getAccessibleDescription,
    jsonNodeToElement,
    jsonToTree,
  } from "@zag-js/json-tree-utils"
  import { jsonTreeData } from "@zag-js/shared"

  const treeData = jsonToTree(jsonTreeData)
</script>

<main>
  {@render JsonTreeNode(treeData, [0])}
</main>

{#snippet KeyNode(node: JsonNode)}
  <span data-kind="key" data-non-enumerable={node.isNonEnumerable ? "" : undefined}>
    {node.key}
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
      {#each node.children as child}
        {@render ValueNode(child)}
      {/each}
    </svelte:element>
  {/if}
{/snippet}

{#snippet JsonTreeNode(node: JsonNode, indexPath: number[])}
  {@const line = indexPath.reduce((acc, curr) => acc + curr, 1)}
  {@const lineLength = indexPath.length - 1}

  {#if node.children && node.children.length > 0}
    <div>
      <div aria-label={getAccessibleDescription(node)}>
        {#if node.key}
          {@render KeyNode(node)}
        {/if}
        {@render ValueNode(jsonNodeToElement(node))}
      </div>
      <div style="padding-left: {indexPath.length * 4}px">
        {#each node.children as child, index}
          {@render JsonTreeNode(child, [...indexPath, index])}
        {/each}
      </div>
    </div>
  {:else}
    <div aria-label={getAccessibleDescription(node)} data-line={line} style="--line-length: {lineLength}">
      {#if node.key}
        {@render KeyNode(node)}
      {/if}
      {@render ValueNode(jsonNodeToElement(node))}
    </div>
  {/if}
{/snippet}

<style>
  main :global(*) {
    font-family: monospace;
    font-size: 12px;
  }

  main :global([data-kind="error-stack"]) {
    display: block;
  }
</style>
