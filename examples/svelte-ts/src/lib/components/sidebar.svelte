<script lang="ts" module>
  import { createFilter } from "@zag-js/i18n-utils"
  import { sidebarTree, type SidebarNode } from "@zag-js/shared"
  import * as tree from "@zag-js/tree-view"

  const baseCollection = tree.collection<SidebarNode>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: sidebarTree,
  })

  const filter = createFilter({ sensitivity: "base" })

  // Mark a node as a keeper if it OR any ancestor matches; needed because `collection.filter`
  // alone would prune children of a matched branch when the children don't themselves match.
  function collectKeepSet(node: SidebarNode, query: string, ancestorMatched: boolean, keep: Set<string>): boolean {
    const selfMatched = ancestorMatched || filter.contains(node.name, query)
    let anyChildKept = false
    for (const child of node.children ?? []) {
      if (collectKeepSet(child, query, selfMatched, keep)) anyChildKept = true
    }
    if (selfMatched || anyChildKept) {
      keep.add(node.id)
      return true
    }
    return false
  }

  function getActiveValueFromPath(pathname: string): string | null {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length < 2) return null
    return `${segments[0]}/${segments[1]}`
  }

  function buildSearch(selected: string | null, expanded: string[]): string {
    const params = new URLSearchParams()
    if (selected) params.set("selected", selected)
    if (expanded.length) params.set("expanded", expanded.join(","))
    const out = params.toString()
    return out ? `?${out}` : ""
  }
</script>

<script lang="ts">
  import { page } from "$app/stores"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-svelte"
  import styles from "@styles/sidebar.module.css"

  let query = $state("")
  let localExpanded = $state<string[] | null>(null)
  let searchExpanded = $state<string[] | null>(null)

  const selectedFromParam = $derived($page.url.searchParams.get("selected"))
  const selectedFromPath = $derived(getActiveValueFromPath($page.url.pathname))
  const activeValue = $derived(selectedFromParam || selectedFromPath)
  const activeBranch = $derived(activeValue?.split("/")[0])

  const expandedRaw = $derived($page.url.searchParams.get("expanded"))
  const expandedFromUrl = $derived.by<string[]>(() => {
    if (expandedRaw == null) return activeBranch ? [activeBranch] : []
    return expandedRaw ? expandedRaw.split(",").filter(Boolean) : []
  })

  const expandedKey = $derived(expandedFromUrl.join("|"))
  $effect(() => {
    expandedKey
    localExpanded = null
  })

  const expandedValue = $derived(localExpanded ?? expandedFromUrl)

  const collection = $derived.by(() => {
    const trimmed = query.trim()
    if (!trimmed) return baseCollection
    const keep = new Set<string>()
    sidebarTree.children?.forEach((child) => collectKeepSet(child, trimmed, false, keep))
    return baseCollection.filter((node) => keep.has(node.id))
  })

  // Search expansion is local-only — searching shouldn't pollute the URL.
  $effect(() => {
    if (!query.trim()) {
      searchExpanded = null
      return
    }
    searchExpanded = collection.getBranchValues()
  })

  const machineExpanded = $derived(searchExpanded ?? expandedValue)

  const id = $props.id()
  const service = useMachine(tree.machine, () => ({
    id,
    collection,
    selectedValue: activeValue ? [activeValue] : [],
    expandedValue: machineExpanded,
    onExpandedChange: (details) => {
      if (query.trim()) {
        searchExpanded = details.expandedValue
        return
      }
      localExpanded = details.expandedValue
    },
  }))

  const api = $derived(tree.connect(service, normalizeProps))
</script>

{#snippet treeNode(node: SidebarNode, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = api.getNodeState(nodeProps)}
  {@const target = node.href ? node : node.children?.find((c) => c.href)}
  {@const nextExpanded =
    nodeState.isBranch && !machineExpanded.includes(node.id) ? [...machineExpanded, node.id] : machineExpanded}
  {@const href = target?.href ? `${target.href}${buildSearch(target.id, nextExpanded)}` : "#"}

  <div {...api.getNodeGroupProps(nodeProps)}>
    <a {href} {...api.getNodeProps(nodeProps)}>
      <div {...api.getNodeCellProps(nodeProps)}>
        {#if nodeState.isBranch}
          <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} class={styles.chevron}>
            <ChevronRightIcon size={14} />
          </span>
        {/if}
        <span {...api.getNodeTextProps(nodeProps)} class={styles.label}>
          {node.name}
        </span>
      </div>
    </a>
    {#if nodeState.isBranch}
      <div {...api.getNodeGroupContentProps(nodeProps)}>
        {#each node.children || [] as child, index}
          {@render treeNode(child, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<aside class={styles.sidebar}>
  <header class={styles.header}>
    <strong>Zagjs</strong>
  </header>

  <div class={styles.search}>
    <SearchIcon size={14} aria-hidden="true" />
    <input type="search" placeholder="Find component" bind:value={query} />
    {#if query}
      <button type="button" class={styles.clear} aria-label="Clear search" onclick={() => (query = "")}>
        <XIcon size={14} />
      </button>
    {/if}
  </div>

  <div {...api.getRootProps()} class={styles.tree}>
    <div {...api.getTreeProps()}>
      {#if collection.rootNode.children?.length}
        {#each collection.rootNode.children as node, index}
          {@render treeNode(node, [index])}
        {/each}
      {:else}
        <p class={styles.empty}>No matches</p>
      {/if}
    </div>
  </div>
</aside>
