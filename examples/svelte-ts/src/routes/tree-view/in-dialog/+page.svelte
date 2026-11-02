<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import { CheckSquareIcon, ChevronRightIcon, MinusSquareIcon, SquareIcon, XIcon } from "lucide-svelte"
  import "@styles/dialog.css"
  import "@styles/tree-view.css"

  interface Node {
    id: string
    name: string
    children?: Node[]
  }

  const rootNode: Node = {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "furniture",
        name: "Furniture",
        children: [
          { id: "furniture/tables-chairs", name: "tables & chairs" },
          { id: "furniture/sofas", name: "sofas" },
          { id: "furniture/occasional", name: "occasional furniture" },
          { id: "furniture/childrens", name: "childrens furniture" },
          { id: "furniture/beds", name: "beds" },
        ],
      },
      {
        id: "decor",
        name: "Decor",
        children: [
          { id: "decor/bed-linen", name: "bed linen" },
          { id: "decor/throws", name: "throws" },
          { id: "decor/curtains-blinds", name: "curtains & blinds" },
          { id: "decor/rugs", name: "rugs" },
          { id: "decor/cushions", name: "cushions" },
        ],
      },
      {
        id: "lighting",
        name: "Lighting",
        children: [
          { id: "lighting/ceiling", name: "ceiling lights" },
          { id: "lighting/lamps", name: "lamps" },
          { id: "lighting/outdoor", name: "outdoor lighting" },
        ],
      },
      {
        id: "storage",
        name: "Storage",
        children: [
          { id: "storage/shelving", name: "shelving" },
          { id: "storage/wardrobes", name: "wardrobes" },
          { id: "storage/boxes", name: "boxes & baskets" },
        ],
      },
    ],
  }

  const initialCollection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode,
  })

  // `checkedValue` only ever contains leaf values (branch checked-state is derived), so this drives "select all".
  const collectLeafValues = (node: Node): string[] => {
    if (!node.children) return [node.id]
    return node.children.flatMap(collectLeafValues)
  }
  const allLeafValues = (rootNode.children ?? []).flatMap(collectLeafValues)

  const iconMap = {
    true: CheckSquareIcon,
    false: SquareIcon,
    indeterminate: MinusSquareIcon,
  }

  const dialogId = $props.id()
  const treeId = `${dialogId}-tree`

  // `committed` is the applied selection; `draft` is the in-dialog working selection.
  let committed = $state<string[]>([])
  let draft = $state<string[]>([])

  let open = $state(false)
  let collection = $state.raw(initialCollection)
  let searchEl = $state<HTMLInputElement | null>(null)

  const resetWorkingState = () => {
    draft = committed
    collection = initialCollection
  }

  const dialogService = useMachine(dialog.machine, () => ({
    id: dialogId,
    open,
    // Roving tabindex makes the first tabbable node unpredictable; focus the search input instead.
    initialFocusEl: () => searchEl,
    onOpenChange(details) {
      open = details.open
      // Fires for user-driven open and dismiss; both start fresh, so a dismiss discards edits.
      resetWorkingState()
    },
  }))
  const dialogApi = $derived(dialog.connect(dialogService, normalizeProps))

  const treeService = useMachine(tree.machine as tree.Machine<Node>, () => ({
    id: treeId,
    collection,
    checkedValue: draft,
    onCheckedChange(details) {
      draft = details.checkedValue
    },
  }))
  const treeApi = $derived(tree.connect(treeService, normalizeProps))

  const selectedCount = $derived(draft.length)
  const allSelected = $derived(selectedCount === allLeafValues.length && selectedCount > 0)
  const someSelected = $derived(selectedCount > 0)
  const SelectAllIcon = $derived(
    iconMap[(allSelected ? "true" : someSelected ? "indeterminate" : "false") as keyof typeof iconMap],
  )

  const handleSearch = (value: string) => {
    if (value.length === 0) {
      collection = initialCollection
      return
    }
    const filtered = initialCollection.filter((node) => node.name.toLowerCase().includes(value.toLowerCase()))
    collection = filtered
    treeApi.setExpandedValue(filtered.getBranchValues())
  }

  const handleCancel = () => {
    resetWorkingState()
    open = false
  }

  const handleOk = () => {
    committed = draft
    open = false
  }
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = treeApi.getNodeState(nodeProps)}
  {@const Icon = iconMap[nodeState.checked.toString() as keyof typeof iconMap]}
  <div {...treeApi.getNodeGroupProps(nodeProps)}>
    <div {...treeApi.getNodeProps(nodeProps)}>
      <div {...treeApi.getNodeCellProps(nodeProps)}>
        {#if nodeState.isBranch}
          <span {...treeApi.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon />
          </span>
        {/if}
        <Icon {...treeApi.getNodeCheckboxProps(nodeProps) as any} />
      </div>
      <div {...treeApi.getNodeCellProps(nodeProps)}>
        <span {...treeApi.getNodeTextProps(nodeProps)}>{node.name}</span>
      </div>
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

<main>
  <button {...dialogApi.getTriggerProps()}>Select categories</button>
  <p>Applied: {committed.length > 0 ? committed.join(", ") : "none"}</p>

  {#if dialogApi.open}
    <Portal>
      <div {...dialogApi.getBackdropProps()}></div>
      <div {...dialogApi.getPositionerProps()}>
        <div
          {...mergeProps(dialogApi.getContentProps(), {
            style: "display: flex; flex-direction: column; gap: 16px; max-height: 80vh; padding: 20px",
          })}
        >
          <header
            style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0"
          >
            <h2 {...mergeProps(dialogApi.getTitleProps(), { style: "margin: 0" })}>Categories</h2>
            <button {...dialogApi.getCloseTriggerProps()}>
              <XIcon />
            </button>
          </header>

          <input
            bind:this={searchEl}
            type="text"
            placeholder="Search categories"
            oninput={(e) => handleSearch(e.currentTarget.value)}
            style="padding: 8px 12px"
          />

          <div style="display: flex; align-items: center; justify-content: space-between">
            <button
              type="button"
              onclick={() => (draft = allSelected ? [] : allLeafValues)}
              style="display: inline-flex; align-items: center; gap: 8px"
            >
              <SelectAllIcon /> Select All
            </button>
            <span style="color: #64748b">{selectedCount} categories selected</span>
          </div>

          <div
            class="tree-view"
            style="flex: 1; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px"
          >
            <div {...mergeProps(treeApi.getTreeProps(), { style: "width: 100%; margin-top: 0" })}>
              {#each collection.rootNode.children ?? [] as node, index (node.id)}
                {@render treeNode(node, [index])}
              {/each}
            </div>
          </div>

          <footer
            style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid #e2e8f0"
          >
            <button type="button" onclick={handleCancel}>Cancel</button>
            <button type="button" onclick={handleOk}>Ok</button>
          </footer>
        </div>
      </div>
    </Portal>
  {/if}
</main>
