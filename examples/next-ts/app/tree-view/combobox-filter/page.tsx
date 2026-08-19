"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import styles from "@styles/tree-view-combobox-filter.module.css"
import { ChevronDownIcon, ChevronRightIcon, FileIcon, FolderIcon, XIcon } from "lucide-react"
import { type JSX, useEffect, useId, useMemo, useRef, useState } from "react"

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

interface TreeNodeProps {
  api: tree.Api
  indexPath: number[]
  node: Node
}

function TreeNode(props: TreeNodeProps): JSX.Element {
  const { api, indexPath, node } = props
  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div {...mergeProps(api.getNodeProps(nodeProps), { className: styles.node })}>
        <div {...api.getNodeCellProps(nodeProps)} className={styles.cell}>
          {nodeState.isBranch ? (
            <>
              <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} className={styles.chevron}>
                <ChevronRightIcon size={14} />
              </span>
              <FolderIcon size={15} />
            </>
          ) : (
            <>
              <span className={styles.chevron} aria-hidden="true" style={{ visibility: "hidden" }}>
                <ChevronRightIcon size={14} />
              </span>
              <FileIcon size={15} />
            </>
          )}
          <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
        </div>
      </div>
      {nodeState.isBranch && (
        <div {...api.getNodeGroupContentProps(nodeProps)} className={styles.groupContent}>
          <div {...api.getIndentGuideProps(nodeProps)} className={styles.indentGuide} />
          {node.children?.map((childNode, index) => (
            <TreeNode key={childNode.id} node={childNode} indexPath={[...indexPath, index]} api={api} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [query, setQuery] = useState("")
  const [expanded, setExpanded] = useState<string[]>([])

  const comboboxCollection = useMemo(
    () =>
      combobox.collection({
        items: flatItems,
        itemToValue: (item) => item.id,
        itemToString: (item) => sourceCollection.stringify(item.id) ?? item.name,
      }),
    [],
  )

  const visibleCollection = useMemo(() => {
    const normalized = query.trim()
    if (!normalized) return sourceCollection
    return sourceCollection.filter((node, indexPath) => {
      const path = sourceCollection.getValuePath(indexPath).join("/")
      return contains(node.name, normalized) || contains(path, normalized)
    })
  }, [query])

  const expandedValue = useMemo(() => {
    if (query.trim()) return visibleCollection.getBranchValues()
    return expanded
  }, [expanded, query, visibleCollection])

  const comboboxService = useMachine(combobox.machine as combobox.Machine<Node>, {
    id: useId(),
    collection: comboboxCollection,
    popupType: "dialog",
    openOnClick: true,
    placeholder: "Search or select a file...",
    closeOnSelect: false,
    onInputValueChange({ inputValue }) {
      setQuery(inputValue)
    },
  })

  const comboboxApi = combobox.connect(comboboxService, normalizeProps)
  const wasOpenRef = useRef(comboboxApi.open)

  useEffect(() => {
    const wasOpen = wasOpenRef.current
    wasOpenRef.current = comboboxApi.open

    if (!wasOpen || comboboxApi.open) return

    setQuery("")
    const selected = comboboxApi.value[0]
    const label = selected ? (sourceCollection.stringify(selected) ?? selected) : ""
    if (comboboxApi.inputValue !== label) {
      comboboxApi.setInputValue(label, "script")
    }
  }, [comboboxApi.open, comboboxApi.inputValue, comboboxApi.value, comboboxApi])

  useEffect(() => {
    if (!comboboxApi.open || query.trim()) return

    const selected = comboboxApi.value[0]
    if (!selected) return

    const ancestors = getAncestorValues(selected)
    setExpanded((prev) => [...new Set([...prev, ...ancestors])])
  }, [comboboxApi.open, comboboxApi.value, query])

  const treeService = useMachine(tree.machine, {
    id: useId(),
    collection: visibleCollection,
    expandedValue,
    selectionMode: "single",
    selectedValue: comboboxApi.value,
    typeahead: false,
    onExpandedChange(details) {
      if (query.trim()) return
      setExpanded(details.expandedValue)
    },
    onSelectionChange(details) {
      const value = details.selectedValue[0]
      if (!value) return
      const label = sourceCollection.stringify(value) ?? value
      comboboxApi.setValue([value])
      comboboxApi.setInputValue(label, "script")
      comboboxApi.setOpen(false)
      setQuery("")
    },
  })

  const treeApi = tree.connect(treeService, normalizeProps)
  const visibleCount = visibleCollection.getValues().length
  const selectedLabel = comboboxApi.value[0] ? sourceCollection.stringify(comboboxApi.value[0]) : null

  return (
    <>
      <main className={styles.root}>
        <div className={styles.header}>
          <h3>Tree Picker</h3>
          <p>Combobox input filters the tree popup. Branches auto-expand while searching.</p>
        </div>

        <div {...comboboxApi.getRootProps()}>
          <label {...mergeProps(comboboxApi.getLabelProps(), { className: styles.label })}>File</label>
          <div {...mergeProps(comboboxApi.getControlProps(), { className: styles.control })}>
            <input
              {...mergeProps(comboboxApi.getInputProps(), {
                className: styles.input,
                onKeyDown(event) {
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
            <button type="button" {...mergeProps(comboboxApi.getTriggerProps(), { className: styles.trigger })}>
              <ChevronDownIcon />
            </button>
            <button
              type="button"
              {...mergeProps(comboboxApi.getClearTriggerProps(), { className: styles.clearTrigger })}
            >
              <XIcon />
            </button>
          </div>
        </div>

        <p className={styles.selection}>
          Selected: <strong>{selectedLabel ?? "none"}</strong>
        </p>

        <Portal>
          <div {...comboboxApi.getPositionerProps()}>
            <div {...mergeProps(comboboxApi.getContentProps(), { className: styles.content })}>
              <div className={styles.treePanel}>
                {visibleCount === 0 ? (
                  <div className={styles.empty}>No matches for &quot;{query.trim()}&quot;</div>
                ) : (
                  <div {...mergeProps(treeApi.getTreeProps(), { className: styles.tree })}>
                    {visibleCollection.rootNode.children?.map((node, index) => (
                      <TreeNode key={node.id} node={node} indexPath={[index]} api={treeApi} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Portal>
      </main>

      <Toolbar>
        <StateVisualizer state={comboboxService} omit={["collection"]} />
        <StateVisualizer state={treeService} omit={["collection"]} label="tree" />
      </Toolbar>
    </>
  )
}
