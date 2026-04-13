import { normalizeProps, useMachine } from "@zag-js/react"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { useId } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Node {
  id: string
  name: string
  children?: Node[]
}

function generateLargeTree(): Node {
  const folders: Node[] = []
  for (let i = 0; i < 50; i++) {
    const children: Node[] = []
    for (let j = 0; j < 20; j++) {
      children.push({ id: `folder-${i}/file-${j}.ts`, name: `file-${j}.ts` })
    }
    folders.push({ id: `folder-${i}`, name: `folder-${i}`, children })
  }
  return { id: "ROOT", name: "", children: folders }
}

const collection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: generateLargeTree(),
})

const ROW_HEIGHT = 32

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  api: tree.Api
}

const TreeNode = (props: TreeNodeProps) => {
  const { node, indexPath, api } = props
  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)
  const indent = nodeState.depth * 20

  return (
    <div
      {...api.getNodeProps(nodeProps)}
      style={{ paddingLeft: indent, height: ROW_HEIGHT, display: "flex", alignItems: "center", gap: "4px" }}
    >
      <div {...api.getCellProps(nodeProps)}>
        {nodeState.isBranch && (
          <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
            <ChevronRightIcon
              size={16}
              style={{
                transform: nodeState.expanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
              }}
            />
          </span>
        )}
        {nodeState.isBranch ? <FolderIcon size={16} /> : <FileIcon size={16} />}
        <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
      </div>
    </div>
  )
}

export default function Page() {
  const controls = useControls(treeviewControls)

  const { virtualizer, ref } = useListVirtualizer({
    count: 0,
    estimatedSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    ...controls.context,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = tree.connect(service, normalizeProps)
  const visibleNodes = api.getVisibleNodes()

  virtualizer.updateOptions({ count: visibleNodes.length })

  return (
    <>
      <main className="tree-view">
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>Virtualized Tree ({visibleNodes.length} visible nodes)</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => api.collapse()}>Collapse All</button>
            <button onClick={() => api.expand()}>Expand All</button>
            {controls.context.selectionMode === "multiple" && (
              <>
                <button onClick={() => api.select()}>Select All</button>
                <button onClick={() => api.deselect()}>Deselect All</button>
              </>
            )}
          </div>

          <div
            ref={ref}
            {...api.getTreeProps()}
            onScroll={virtualizer.handleScroll}
            style={{ height: 400, overflow: "auto", border: "1px solid #ccc", borderRadius: "4px" }}
          >
            <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const { node, indexPath } = visibleNodes[vi.index]
                return (
                  <div key={node.id} data-index={vi.index} style={virtualizer.getItemStyle(vi)}>
                    <TreeNode node={node} indexPath={indexPath} api={api} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
