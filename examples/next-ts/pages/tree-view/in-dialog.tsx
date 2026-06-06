import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { CheckSquare, ChevronRightIcon, MinusSquare, Square, XIcon } from "lucide-react"
import { JSX, useId, useRef, useState } from "react"

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

// Collect every leaf value once. `checkedValue` only ever contains leaf
// values (branch checked-state is derived), so this drives "select all".
const collectLeafValues = (node: Node): string[] => {
  if (!node.children) return [node.id]
  return node.children.flatMap(collectLeafValues)
}
const allLeafValues = (rootNode.children ?? []).flatMap(collectLeafValues)

const iconMap = {
  true: CheckSquare,
  false: Square,
  indeterminate: MinusSquare,
}

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  api: tree.Api
}

function TreeNodeCheckbox(props: TreeNodeProps) {
  const { api, ...nodeProps } = props
  const nodeState = api.getNodeState(nodeProps)
  const checkboxProps = api.getNodeCheckboxProps(nodeProps)
  const Icon = iconMap[nodeState.checked.toString() as keyof typeof iconMap]
  return <Icon {...checkboxProps} />
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props
  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  if (nodeState.isBranch) {
    return (
      <div {...api.getBranchProps(nodeProps)}>
        <div {...api.getBranchControlProps(nodeProps)}>
          <TreeNodeCheckbox {...props} />
          <span {...api.getBranchTextProps(nodeProps)}>{node.name}</span>
          <span {...api.getBranchIndicatorProps(nodeProps)}>
            <ChevronRightIcon />
          </span>
        </div>
        <div {...api.getBranchContentProps(nodeProps)}>
          <div {...api.getBranchIndentGuideProps(nodeProps)} />
          {node.children?.map((childNode, index) => (
            <TreeNode key={childNode.id} node={childNode} indexPath={[...indexPath, index]} api={api} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...api.getItemProps(nodeProps)}>
      <TreeNodeCheckbox {...props} /> {node.name}
    </div>
  )
}

export default function Page() {
  const dialogId = useId()
  const treeId = useId()

  // `committed` is the applied selection; `draft` is the in-dialog working
  // selection. They only sync on OK (commit) or on open/cancel/dismiss (revert).
  const [committed, setCommitted] = useState<string[]>([])
  const [draft, setDraft] = useState<string[]>([])

  const [open, setOpen] = useState(false)
  const [collection, setCollection] = useState(initialCollection)
  const searchRef = useRef<HTMLInputElement>(null)

  const resetWorkingState = () => {
    setDraft(committed)
    setCollection(initialCollection)
  }

  const dialogService = useMachine(dialog.machine, {
    id: dialogId,
    open,
    // Focus-trap would otherwise grab the first tabbable node (which, with the
    // tree's roving tabindex, can be unpredictable). Point initial focus at the
    // search input instead.
    initialFocusEl: () => searchRef.current,
    onOpenChange(details) {
      setOpen(details.open)
      // Fires only for user-driven open (trigger) and dismiss (Esc/backdrop/X).
      // Both start the working state fresh from the committed selection; a
      // dismiss therefore discards uncommitted edits.
      resetWorkingState()
    },
  })
  const dialogApi = dialog.connect(dialogService, normalizeProps)

  const treeService = useMachine(tree.machine as tree.Machine<Node>, {
    id: treeId,
    collection,
    checkedValue: draft,
    onCheckedChange(details) {
      setDraft(details.checkedValue)
    },
  })
  const treeApi = tree.connect(treeService, normalizeProps)

  const selectedCount = draft.length
  const allSelected = selectedCount === allLeafValues.length && selectedCount > 0
  const someSelected = selectedCount > 0
  const SelectAllIcon =
    iconMap[(allSelected ? "true" : someSelected ? "indeterminate" : "false") as keyof typeof iconMap]

  const handleSearch = (value: string) => {
    if (value.length === 0) {
      setCollection(initialCollection)
      return
    }
    const filtered = initialCollection.filter((node) => node.name.toLowerCase().includes(value.toLowerCase()))
    setCollection(filtered)
    treeApi.setExpandedValue(filtered.getBranchValues())
  }

  const handleCancel = () => {
    resetWorkingState()
    setOpen(false)
  }

  const handleOk = () => {
    setCommitted(draft)
    setOpen(false)
  }

  return (
    <main>
      <button {...dialogApi.getTriggerProps()}>Select categories</button>
      <p>Applied: {committed.length > 0 ? committed.join(", ") : "none"}</p>

      {dialogApi.open && (
        <Portal>
          <div {...dialogApi.getBackdropProps()} />
          <div {...dialogApi.getPositionerProps()}>
            <div
              {...dialogApi.getContentProps()}
              style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "80vh", padding: "20px" }}
            >
              <header
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <h2 {...dialogApi.getTitleProps()} style={{ margin: 0 }}>
                  Categories
                </h2>
                <button {...dialogApi.getCloseTriggerProps()} aria-label="Close">
                  <XIcon />
                </button>
              </header>

              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories"
                onChange={(e) => handleSearch(e.target.value)}
                style={{ padding: "8px 12px" }}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => setDraft(allSelected ? [] : allLeafValues)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <SelectAllIcon /> Select All
                </button>
                <span style={{ color: "#64748b" }}>{selectedCount} categories selected</span>
              </div>

              <div
                className="tree-view"
                style={{ flex: 1, overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px" }}
              >
                <div {...treeApi.getTreeProps()} style={{ width: "100%", marginTop: 0 }}>
                  {collection.rootNode.children?.map((node, index) => (
                    <TreeNode key={node.id} node={node} indexPath={[index]} api={treeApi} />
                  ))}
                </div>
              </div>

              <footer
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button type="button" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="button" onClick={handleOk}>
                  Ok
                </button>
              </footer>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
