import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import { CheckSquareIcon, ChevronRightIcon, MinusSquareIcon, SquareIcon, XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Index, Show, type Accessor, type JSX } from "solid-js"
import { Dynamic, Portal } from "solid-js/web"
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

// Collect every leaf value once. `checkedValue` only ever contains leaf
// values (branch checked-state is derived), so this drives "select all".
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

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  api: Accessor<tree.Api>
}

function TreeNodeCheckbox(props: TreeNodeProps) {
  const nodeProps = { indexPath: props.indexPath, node: props.node }
  const nodeState = createMemo(() => props.api().getNodeState(nodeProps))
  return (
    <Dynamic
      component={iconMap[nodeState().checked.toString() as keyof typeof iconMap]}
      {...props.api().getNodeCheckboxProps(nodeProps)}
    />
  )
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props
  const nodeProps = { indexPath, node }
  const nodeState = createMemo(() => api().getNodeState(nodeProps))

  return (
    <div {...api().getNodeGroupProps(nodeProps)}>
      <div {...api().getNodeProps(nodeProps)}>
        <div {...api().getNodeCellProps(nodeProps)}>
          <TreeNodeCheckbox {...props} />
          <span {...api().getNodeTextProps(nodeProps)}>{node.name}</span>
          <Show when={nodeState().isBranch}>
            <span {...api().getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          </Show>
        </div>
      </div>
      <Show when={nodeState().isBranch}>
        <div {...api().getNodeGroupContentProps(nodeProps)}>
          <div {...api().getIndentGuideProps(nodeProps)} />
          <Index each={node.children}>
            {(childNode, index) => <TreeNode node={childNode()} indexPath={[...indexPath, index]} api={api} />}
          </Index>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const dialogId = createUniqueId()
  const treeId = createUniqueId()

  // `committed` is the applied selection; `draft` is the in-dialog working selection.
  const [committed, setCommitted] = createSignal<string[]>([])
  const [draft, setDraft] = createSignal<string[]>([])

  const [open, setOpen] = createSignal(false)
  const [collection, setCollection] = createSignal(initialCollection)
  let searchRef: HTMLInputElement | undefined

  const resetWorkingState = () => {
    setDraft(committed())
    setCollection(initialCollection)
  }

  const dialogService = useMachine(dialog.machine, () => ({
    id: dialogId,
    open: open(),
    // Roving tabindex makes the first tabbable node unpredictable; focus search instead
    initialFocusEl: () => searchRef ?? null,
    onOpenChange(details) {
      setOpen(details.open)
      // User-driven open/dismiss both reset from the committed selection
      resetWorkingState()
    },
  }))
  const dialogApi = createMemo(() => dialog.connect(dialogService, normalizeProps))

  const treeService = useMachine(tree.machine as tree.Machine<Node>, (): tree.Props<Node> => ({
    id: treeId,
    collection: collection(),
    checkedValue: draft(),
    onCheckedChange(details) {
      setDraft(details.checkedValue)
    },
  }))
  const treeApi = createMemo(() => tree.connect(treeService, normalizeProps))

  const selectedCount = () => draft().length
  const allSelected = () => selectedCount() === allLeafValues.length && selectedCount() > 0
  const someSelected = () => selectedCount() > 0
  const selectAllIcon = () =>
    iconMap[(allSelected() ? "true" : someSelected() ? "indeterminate" : "false") as keyof typeof iconMap]

  const handleSearch = (value: string) => {
    if (value.length === 0) {
      setCollection(initialCollection)
      return
    }
    const filtered = initialCollection.filter((node) => node.name.toLowerCase().includes(value.toLowerCase()))
    setCollection(filtered)
    treeApi().setExpandedValue(filtered.getBranchValues())
  }

  const handleCancel = () => {
    resetWorkingState()
    setOpen(false)
  }

  const handleOk = () => {
    setCommitted(draft())
    setOpen(false)
  }

  return (
    <main>
      <button {...dialogApi().getTriggerProps()}>Select categories</button>
      <p>Applied: {committed().length > 0 ? committed().join(", ") : "none"}</p>

      <Show when={dialogApi().open}>
        <Portal>
          <div {...dialogApi().getBackdropProps()} />
          <div {...dialogApi().getPositionerProps()}>
            <div
              {...dialogApi().getContentProps()}
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: "16px",
                "max-height": "80vh",
                padding: "20px",
              }}
            >
              <header
                style={{
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "space-between",
                  "padding-bottom": "12px",
                  "border-bottom": "1px solid #e2e8f0",
                }}
              >
                <h2 {...dialogApi().getTitleProps()} style={{ margin: 0 }}>
                  Categories
                </h2>
                <button {...dialogApi().getCloseTriggerProps()}>
                  <XIcon />
                </button>
              </header>

              <input
                ref={searchRef}
                type="text"
                placeholder="Search categories"
                onInput={(e) => handleSearch(e.currentTarget.value)}
                style={{ padding: "8px 12px" }}
              />

              <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between" }}>
                <button
                  type="button"
                  onClick={() => setDraft(allSelected() ? [] : allLeafValues)}
                  style={{ display: "inline-flex", "align-items": "center", gap: "8px" }}
                >
                  <Dynamic component={selectAllIcon()} /> Select All
                </button>
                <span style={{ color: "#64748b" }}>{selectedCount()} categories selected</span>
              </div>

              <div
                class="tree-view"
                style={{
                  flex: 1,
                  "overflow-y": "auto",
                  border: "1px solid #e2e8f0",
                  "border-radius": "6px",
                  padding: "8px",
                }}
              >
                <div {...treeApi().getTreeProps()} style={{ width: "100%", "margin-top": 0 }}>
                  <For each={collection().rootNode.children}>
                    {(node, index) => <TreeNode node={node} indexPath={[index()]} api={treeApi} />}
                  </For>
                </div>
              </div>

              <footer
                style={{
                  display: "flex",
                  "justify-content": "flex-end",
                  gap: "8px",
                  "padding-top": "12px",
                  "border-top": "1px solid #e2e8f0",
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
      </Show>
    </main>
  )
}
