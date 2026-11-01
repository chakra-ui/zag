<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as combobox from "@zag-js/combobox"
  import { createFilter } from "@zag-js/i18n-utils"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tree from "@zag-js/tree-view"
  import styles from "@styles/tree-view-combobox-filter.module.css"
  import { ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon, XIcon } from "lucide-svelte"
  import { untrack } from "svelte"

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
      { id: "panda.config", name: "panda.config.ts" },
      { id: "package.json", name: "package.json" },
      { id: "readme.md", name: "README.md" },
    ],
  }

  const sourceCollection = tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode,
  })

  function flattenNodes(nodes: Node[] | undefined, items: Node[] = []) {
    for (const node of nodes ?? []) {
      items.push(node)
      flattenNodes(node.children, items)
    }
    return items
  }

  const flatItems = flattenNodes(rootNode.children)

  const { contains } = createFilter({ sensitivity: "base" })

  function getAncestorValues(value: string) {
    return sourceCollection.getParentNodes(value).map((node) => sourceCollection.getNodeValue(node))
  }

  const comboboxCollection = combobox.collection({
    items: flatItems,
    itemToValue: (item) => item.id,
    itemToString: (item) => sourceCollection.stringify(item.id) ?? item.name,
  })

  let query = $state("")
  let expanded = $state<string[]>([])

  const visibleCollection = $derived.by(() => {
    const normalized = query.trim()
    if (!normalized) return sourceCollection
    return sourceCollection.filter((node, indexPath) => {
      const path = sourceCollection.getValuePath(indexPath).join("/")
      return contains(node.name, normalized) || contains(path, normalized)
    })
  })

  const expandedValue = $derived(query.trim() ? visibleCollection.getBranchValues() : expanded)

  const comboboxId = $props.id()
  const comboboxService = useMachine(combobox.machine as combobox.Machine<Node>, {
    id: comboboxId,
    collection: comboboxCollection,
    popupType: "dialog",
    openOnClick: true,
    placeholder: "Search or select a file...",
    closeOnSelect: false,
    onInputValueChange({ inputValue }) {
      query = inputValue
    },
  })

  const comboboxApi = $derived(combobox.connect(comboboxService, normalizeProps))

  // Restore the selected label once the popup closes
  let wasOpen = false
  $effect(() => {
    const open = comboboxApi.open
    untrack(() => {
      const prev = wasOpen
      wasOpen = open
      if (!prev || open) return
      query = ""
      const selected = comboboxApi.value[0]
      const label = selected ? (sourceCollection.stringify(selected) ?? selected) : ""
      if (comboboxApi.inputValue !== label) {
        comboboxApi.setInputValue(label, "script")
      }
    })
  })

  // Reveal the selected file when reopening without a query
  $effect(() => {
    if (!comboboxApi.open || query.trim()) return
    const selected = comboboxApi.value[0]
    if (!selected) return
    const ancestors = getAncestorValues(selected)
    untrack(() => {
      expanded = [...new Set([...expanded, ...ancestors])]
    })
  })

  const treeService = useMachine(tree.machine as tree.Machine<Node>, (): tree.Props<Node> => ({
    id: `${comboboxId}-tree`,
    collection: visibleCollection,
    expandedValue,
    selectionMode: "single",
    selectedValue: comboboxApi.value,
    typeahead: false,
    onExpandedChange(details) {
      if (query.trim()) return
      expanded = details.expandedValue
    },
    onSelectionChange(details) {
      const value = details.selectedValue[0]
      if (!value) return
      // Files only: a folder just expands or collapses
      const node = sourceCollection.findNode(value)
      if (node && sourceCollection.isBranchNode(node)) return
      const label = sourceCollection.stringify(value) ?? value
      comboboxApi.setValue([value])
      comboboxApi.setInputValue(label, "script")
      comboboxApi.setOpen(false)
      query = ""
    },
  }))

  const treeApi = $derived(tree.connect(treeService, normalizeProps))
  const visibleCount = $derived(visibleCollection.getValues().length)
  const selectedLabel = $derived(comboboxApi.value[0] ? sourceCollection.stringify(comboboxApi.value[0]) : null)
</script>

{#snippet treeNode(node: Node, indexPath: number[])}
  {@const nodeProps = { indexPath, node }}
  {@const nodeState = treeApi.getNodeState(nodeProps)}
  <div {...treeApi.getNodeGroupProps(nodeProps)}>
    <div {...mergeProps(treeApi.getNodeProps(nodeProps), { class: styles.node })}>
      <div {...treeApi.getNodeCellProps(nodeProps)} class={styles.cell}>
        {#if nodeState.isBranch}
          <span {...treeApi.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} class={styles.chevron}>
            <ChevronRightIcon size={14} />
          </span>
          <FolderIcon size={15} />
        {:else}
          <span class={styles.chevron} aria-hidden="true" style="visibility: hidden">
            <ChevronRightIcon size={14} />
          </span>
          <FileIcon size={15} />
        {/if}
        <span {...treeApi.getNodeTextProps(nodeProps)}>{node.name}</span>
      </div>
    </div>
    {#if nodeState.isBranch}
      <div {...treeApi.getNodeGroupContentProps(nodeProps)} class={styles.groupContent}>
        <div {...treeApi.getIndentGuideProps(nodeProps)} class={styles.indentGuide}></div>
        {#each node.children ?? [] as childNode, index (childNode.id)}
          {@render treeNode(childNode, [...indexPath, index])}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<main>
  <div class={styles.root}>
    <div class={styles.header}>
      <h3>Tree Picker</h3>
      <p>Combobox input filters the tree popup. Branches auto-expand while searching.</p>
    </div>

    <div {...comboboxApi.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...mergeProps(comboboxApi.getLabelProps(), { class: styles.label })}>File</label>
      <div {...mergeProps(comboboxApi.getControlProps(), { class: styles.control })}>
        <input
          {...mergeProps(comboboxApi.getInputProps(), {
            class: styles.input,
            onkeydown(event: KeyboardEvent) {
              if (!comboboxApi.open) return
              if (event.key === "ArrowDown") {
                const first = visibleCollection.getFirstNode()
                if (first) {
                  treeApi.focus(sourceCollection.getNodeValue(first))
                  event.preventDefault()
                }
              }
            },
          })}
        />
        <button
          type="button"
          {...mergeProps(comboboxApi.getTriggerProps({ focusable: false }), { class: styles.trigger })}
        >
          <ChevronDownIcon />
        </button>
        <button type="button" {...mergeProps(comboboxApi.getClearTriggerProps(), { class: styles.clearTrigger })}>
          <XIcon />
        </button>
      </div>
    </div>

    <p class={styles.selection}>
      Selected: <strong>{selectedLabel ?? "none"}</strong>
    </p>

    <Portal>
      <div {...comboboxApi.getPositionerProps()}>
        <div {...mergeProps(comboboxApi.getContentProps(), { class: styles.content })}>
          <div class={styles.treePanel}>
            {#if visibleCount === 0}
              <div class={styles.empty}>No matches for "{query.trim()}"</div>
            {:else}
              <div {...mergeProps(treeApi.getTreeProps(), { class: styles.tree })}>
                {#each visibleCollection.rootNode.children ?? [] as node, index (node.id)}
                  {@render treeNode(node, [index])}
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={comboboxService} omit={["collection"]} />
  <StateVisualizer state={treeService} omit={["collection"]} label="tree" />
</Toolbar>
