import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual"
import { normalizeProps, useMachine } from "@zag-js/react"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

interface Node {
  id: string
  name: string
  children?: Node[]
}

// Generate a large tree for virtualization demo
function generateLargeTree(): Node {
  const folders: Node[] = []

  for (let i = 0; i < 50; i++) {
    const children: Node[] = []
    for (let j = 0; j < 20; j++) {
      children.push({
        id: `folder-${i}/file-${j}.ts`,
        name: `file-${j}.ts`,
      })
    }
    folders.push({
      id: `folder-${i}`,
      name: `folder-${i}`,
      children,
    })
  }

  return {
    id: "ROOT",
    name: "",
    children: folders,
  }
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

  // Calculate indentation based on depth
  const indent = nodeState.depth * 20

  if (nodeState.isBranch) {
    return (
      <div
        {...api.getBranchControlProps(nodeProps)}
        style={{
          paddingLeft: indent,
          height: ROW_HEIGHT,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span {...api.getBranchIndicatorProps(nodeProps)}>
          <ChevronRightIcon
            size={16}
            style={{
              transform: nodeState.expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
            }}
          />
        </span>
        <FolderIcon size={16} />
        <span {...api.getBranchTextProps(nodeProps)}>{node.name}</span>
      </div>
    )
  }

  return (
    <div
      {...api.getItemProps(nodeProps)}
      style={{
        paddingLeft: indent,
        height: ROW_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <FileIcon size={16} />
      <span {...api.getItemTextProps(nodeProps)}>{node.name}</span>
    </div>
  )
}

export default function Page() {
  const controls = useControls(treeviewControls)
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizerRef = useRef<Virtualizer<HTMLDivElement, Element>>(null)

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    ...controls.context,
    scrollToIndexFn(details) {
      virtualizerRef.current?.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = tree.connect(service, normalizeProps)

  // Get visible nodes (now returns { node, indexPath }[])
  const visibleNodes = api.getVisibleNodes()

  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  // Keep ref updated for scrollToIndexFn
  virtualizerRef.current = virtualizer

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

          {/* Scrollable container */}
          <div
            ref={parentRef}
            {...api.getTreeProps()}
            style={{
              height: 400,
              overflow: "auto",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            {/* Total size container */}
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {/* Only render visible items */}
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const { node, indexPath } = visibleNodes[virtualItem.index]

                return (
                  <div
                    key={node.id}
                    data-index={virtualItem.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
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
