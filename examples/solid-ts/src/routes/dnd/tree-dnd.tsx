import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import * as dnd from "@zag-js/dnd"
import { ChevronRightIcon, FileIcon, FolderIcon, GripVertical } from "lucide-solid"
import { Accessor, createMemo, createSignal, createUniqueId, Index, JSX, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-tree.module.css"
import "@styles/tree-view.css"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const initialData: Node = {
  id: "ROOT",
  name: "",
  children: [
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
    {
      id: "public",
      name: "public",
      children: [
        { id: "public/favicon.ico", name: "favicon.ico" },
        { id: "public/logo.svg", name: "logo.svg" },
      ],
    },
    { id: "package.json", name: "package.json" },
    { id: "tsconfig.json", name: "tsconfig.json" },
    { id: "readme.md", name: "README.md" },
  ],
}

function createCollection(rootNode: Node) {
  return tree.collection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode,
  })
}

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  treeApi: Accessor<tree.Api>
  dndApi: Accessor<dnd.Api>
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { treeApi, dndApi } = props
  const nodeProps = () => ({ indexPath: props.indexPath, node: props.node })
  const nodeState = createMemo(() => treeApi().getNodeState(nodeProps()))

  return (
    <div {...treeApi().getNodeGroupProps(nodeProps())}>
      <div
        {...mergeProps(treeApi().getNodeProps(nodeProps()), dndApi().getDropTargetProps({ value: props.node.id }), {
          class: styles.dropTarget,
        })}
      >
        <div
          {...dndApi().getDropIndicatorProps({ value: props.node.id, placement: "before" })}
          class={styles.dropIndicator}
          style={{ "--depth": nodeState().depth }}
        />

        <div {...treeApi().getNodeCellProps(nodeProps())} class={styles.cell}>
          <span {...dndApi().getDragHandleProps({ value: props.node.id })} class={styles.dragHandle}>
            <GripVertical size={14} />
          </span>
          <Show when={nodeState().isBranch}>
            <span {...treeApi().getNodeIndicatorProps({ ...nodeProps(), type: "expanded" })}>
              <ChevronRightIcon size={14} />
            </span>
          </Show>
          <Show when={nodeState().isBranch} fallback={<FileIcon size={14} />}>
            <FolderIcon size={14} />
          </Show>
          <span {...treeApi().getNodeTextProps(nodeProps())}>{props.node.name}</span>
        </div>

        <div
          {...dndApi().getDropIndicatorProps({ value: props.node.id, placement: "after" })}
          class={styles.dropIndicator}
          style={{ "--depth": nodeState().depth }}
        />
      </div>

      <Show when={nodeState().isBranch}>
        <div {...treeApi().getNodeGroupContentProps(nodeProps())}>
          <div {...treeApi().getIndentGuideProps(nodeProps())} />
          <Index each={props.node.children}>
            {(childNode, index) => (
              <TreeNode node={childNode()} indexPath={[...props.indexPath, index]} treeApi={treeApi} dndApi={dndApi} />
            )}
          </Index>
        </div>
      </Show>
    </div>
  )
}

export default function Page() {
  const [collection, setCollection] = createSignal(createCollection(initialData))
  const [expandedValue, setExpandedValue] = createSignal<string[]>(["src", "public"])

  const treeId = createUniqueId()
  const treeService = useMachine(tree.machine, () => ({
    id: treeId,
    collection: collection(),
    expandedValue: expandedValue(),
    onExpandedChange(details: tree.ExpandedChangeDetails) {
      setExpandedValue(details.expandedValue)
    },
  }))
  const treeApi = createMemo(() => tree.connect(treeService, normalizeProps))

  const dndService = useMachine(dnd.machine, {
    id: createUniqueId(),
    dropPlacements: ["before", "after", "on"],
    getValueText(value) {
      return collection().stringify(value) ?? value
    },
    canDrop(source, target, placement) {
      if (source === target && placement === "on") return false
      const sourcePath = collection().getIndexPath(source)
      const targetPath = collection().getIndexPath(target)
      if (sourcePath && targetPath) {
        return !collection().contains(sourcePath, targetPath)
      }
      return true
    },
    onDrop({ source, target, placement }) {
      const current = collection()
      const sourcePath = current.getIndexPath(source)
      const targetPath = current.getIndexPath(target)
      if (!sourcePath || !targetPath) return

      let toPath: number[]
      switch (placement) {
        case "before":
          toPath = targetPath
          break
        case "after":
          toPath = [...targetPath.slice(0, -1), targetPath[targetPath.length - 1] + 1]
          break
        case "on":
          toPath = [...targetPath, 0]
          setExpandedValue((prev) => [...new Set([...prev, target])])
          break
      }

      setCollection(current.move([sourcePath], toPath))
    },
  })
  const dndApi = createMemo(() => dnd.connect(dndService, normalizeProps))

  return (
    <>
      <main class="tree-view">
        <div {...treeApi().getRootProps()}>
          <h3 {...treeApi().getLabelProps()}>File Explorer (Drag & Drop)</h3>
          <div {...dndApi().getRootProps()} class={styles.root}>
            <div {...treeApi().getTreeProps()}>
              <Index each={collection().rootNode.children}>
                {(node, index) => <TreeNode node={node()} indexPath={[index]} treeApi={treeApi} dndApi={dndApi} />}
              </Index>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={dndService} />
      </Toolbar>
    </>
  )
}
