import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import styles from "@styles/tree-view-combobox-filter.module.css"
import { ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon, XIcon } from "lucide-solid"
import { Accessor, createEffect, createMemo, createSignal, createUniqueId, Index, JSX, on, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

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

const comboboxCollection = combobox.collection({
  items: flatItems,
  itemToValue: (item) => item.id,
  itemToString: (item) => sourceCollection.stringify(item.id) ?? item.name,
})

const { contains } = createFilter({ sensitivity: "base" })

function getAncestorValues(value: string) {
  return sourceCollection.getParentNodes(value).map((node) => sourceCollection.getNodeValue(node))
}

interface TreeNodeProps {
  api: Accessor<tree.Api>
  indexPath: number[]
  node: Node
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const nodeProps = () => ({ indexPath: props.indexPath, node: props.node })
  const nodeState = createMemo(() => props.api().getNodeState(nodeProps()))

  return (
    <div {...props.api().getNodeGroupProps(nodeProps())}>
      <div {...mergeProps(props.api().getNodeProps(nodeProps()), { class: styles.node })}>
        <div {...props.api().getNodeCellProps(nodeProps())} class={styles.cell}>
          <Show
            when={nodeState().isBranch}
            fallback={
              <>
                <span class={styles.chevron} aria-hidden="true" style={{ visibility: "hidden" }}>
                  <ChevronRightIcon size={14} />
                </span>
                <FileIcon size={15} />
              </>
            }
          >
            <span {...props.api().getNodeIndicatorProps({ ...nodeProps(), type: "expanded" })} class={styles.chevron}>
              <ChevronRightIcon size={14} />
            </span>
            <FolderIcon size={15} />
          </Show>
          <span {...props.api().getNodeTextProps(nodeProps())}>{props.node.name}</span>
        </div>
      </div>
      <Show when={nodeState().isBranch}>
        <div {...props.api().getNodeGroupContentProps(nodeProps())} class={styles.groupContent}>
          <div {...props.api().getIndentGuideProps(nodeProps())} class={styles.indentGuide} />
          <Index each={props.node.children}>
            {(childNode, index) => (
              <TreeNode node={childNode()} indexPath={[...props.indexPath, index]} api={props.api} />
            )}
          </Index>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const [query, setQuery] = createSignal("")
  const [expanded, setExpanded] = createSignal<string[]>([])

  const visibleCollection = createMemo(() => {
    const normalized = query().trim()
    if (!normalized) return sourceCollection
    return sourceCollection.filter((node, indexPath) => {
      const path = sourceCollection.getValuePath(indexPath).join("/")
      return contains(node.name, normalized) || contains(path, normalized)
    })
  })

  const expandedValue = createMemo(() => {
    if (query().trim()) return visibleCollection().getBranchValues()
    return expanded()
  })

  const comboboxService = useMachine(combobox.machine as combobox.Machine<Node>, {
    id: createUniqueId(),
    collection: comboboxCollection,
    popupType: "dialog",
    openOnClick: true,
    placeholder: "Search or select a file...",
    closeOnSelect: false,
    onInputValueChange({ inputValue }) {
      setQuery(inputValue)
    },
  })

  const comboboxApi = createMemo(() => combobox.connect(comboboxService, normalizeProps))

  createEffect(
    on(
      () => comboboxApi().open,
      (open, wasOpen) => {
        if (!wasOpen || open) return
        setQuery("")
        const api = comboboxApi()
        const selected = api.value[0]
        const label = selected ? (sourceCollection.stringify(selected) ?? selected) : ""
        if (api.inputValue !== label) {
          api.setInputValue(label, "script")
        }
      },
    ),
  )

  createEffect(() => {
    const api = comboboxApi()
    if (!api.open || query().trim()) return
    const selected = api.value[0]
    if (!selected) return
    const ancestors = getAncestorValues(selected)
    setExpanded((prev) => [...new Set([...prev, ...ancestors])])
  })

  const treeId = createUniqueId()
  const treeService = useMachine(tree.machine, () => ({
    id: treeId,
    collection: visibleCollection(),
    expandedValue: expandedValue(),
    selectionMode: "single" as const,
    selectedValue: comboboxApi().value,
    typeahead: false,
    onExpandedChange(details: tree.ExpandedChangeDetails) {
      if (query().trim()) return
      setExpanded(details.expandedValue)
    },
    onSelectionChange(details: tree.SelectionChangeDetails) {
      const value = details.selectedValue[0]
      if (!value) return
      // Files only: a folder just expands or collapses
      const node = sourceCollection.findNode(value)
      if (node && sourceCollection.isBranchNode(node)) return
      const label = sourceCollection.stringify(value) ?? value
      const api = comboboxApi()
      api.setValue([value])
      api.setInputValue(label, "script")
      api.setOpen(false)
      setQuery("")
    },
  }))

  const treeApi = createMemo(() => tree.connect(treeService, normalizeProps))
  const visibleCount = createMemo(() => visibleCollection().getValues().length)
  const selectedLabel = createMemo(() => {
    const selected = comboboxApi().value[0]
    return selected ? sourceCollection.stringify(selected) : null
  })

  return (
    <>
      <main>
        <div class={styles.root}>
          <div class={styles.header}>
            <h3>Tree Picker</h3>
            <p>Combobox input filters the tree popup. Branches auto-expand while searching.</p>
          </div>

          <div {...comboboxApi().getRootProps()}>
            <label {...mergeProps(comboboxApi().getLabelProps(), { class: styles.label })}>File</label>
            <div {...mergeProps(comboboxApi().getControlProps(), { class: styles.control })}>
              <input
                {...mergeProps(comboboxApi().getInputProps(), {
                  class: styles.input,
                  onKeyDown(event: KeyboardEvent) {
                    if (!comboboxApi().open) return
                    if (event.key === "ArrowDown") {
                      const first = visibleCollection().getFirstNode()
                      if (first) {
                        treeApi().focus(sourceCollection.getNodeValue(first))
                        event.preventDefault()
                      }
                    }
                  },
                })}
              />
              <button
                type="button"
                {...mergeProps(comboboxApi().getTriggerProps({ focusable: false }), { class: styles.trigger })}
              >
                <ChevronDownIcon />
              </button>
              <button
                type="button"
                {...mergeProps(comboboxApi().getClearTriggerProps(), { class: styles.clearTrigger })}
              >
                <XIcon />
              </button>
            </div>
          </div>

          <p class={styles.selection}>
            Selected: <strong>{selectedLabel() ?? "none"}</strong>
          </p>

          <Portal>
            <div {...comboboxApi().getPositionerProps()}>
              <div {...mergeProps(comboboxApi().getContentProps(), { class: styles.content })}>
                <div class={styles.treePanel}>
                  <Show
                    when={visibleCount() > 0}
                    fallback={<div class={styles.empty}>No matches for "{query().trim()}"</div>}
                  >
                    <div {...mergeProps(treeApi().getTreeProps(), { class: styles.tree })}>
                      <Index each={visibleCollection().rootNode.children}>
                        {(node, index) => <TreeNode node={node()} indexPath={[index]} api={treeApi} />}
                      </Index>
                    </div>
                  </Show>
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
    </>
  )
}
