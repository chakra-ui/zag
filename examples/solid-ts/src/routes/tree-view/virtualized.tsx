import { normalizeProps, useMachine } from "@zag-js/solid"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-solid"
import { Accessor, createEffect, createMemo, createUniqueId, Index, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import "@styles/tree-view.css"

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
  api: Accessor<tree.Api>
}

const TreeNode = (props: TreeNodeProps) => {
  const nodeProps = () => ({ indexPath: props.indexPath, node: props.node })
  const nodeState = createMemo(() => props.api().getNodeState(nodeProps()))

  return (
    <div
      {...props.api().getNodeProps(nodeProps())}
      style={{
        "padding-left": `${nodeState().depth * 20}px`,
        height: `${ROW_HEIGHT}px`,
        display: "flex",
        "align-items": "center",
        gap: "4px",
      }}
    >
      <div {...props.api().getNodeCellProps(nodeProps())}>
        <Show when={nodeState().isBranch}>
          <span {...props.api().getNodeIndicatorProps({ ...nodeProps(), type: "expanded" })}>
            <ChevronRightIcon size={16} />
          </span>
        </Show>
        <Show when={nodeState().isBranch} fallback={<FileIcon size={16} />}>
          <FolderIcon size={16} />
        </Show>
        <span {...props.api().getNodeTextProps(nodeProps())}>{props.node.name}</span>
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

  const service = useMachine(
    tree.machine,
    controls.mergeProps<tree.Props<Node>>({
      id: createUniqueId(),
      collection,
      scrollToIndexFn(details) {
        virtualizer.scrollToIndex(details.index, { align: "auto" })
      },
    }),
  )

  const api = createMemo(() => tree.connect(service, normalizeProps))
  const visibleNodes = createMemo(() => api().getVisibleNodes())

  createEffect(() => {
    virtualizer.updateOptions({ count: visibleNodes().length })
  })

  return (
    <>
      <main class="tree-view">
        <div {...api().getRootProps()}>
          <h3 {...api().getLabelProps()}>Virtualized Tree ({visibleNodes().length} visible nodes)</h3>
          <div style={{ display: "flex", gap: "10px", "margin-bottom": "10px" }}>
            <button onClick={() => api().collapse()}>Collapse All</button>
            <button onClick={() => api().expand()}>Expand All</button>
            <Show when={controls.state().selectionMode === "multiple"}>
              <button onClick={() => api().select()}>Select All</button>
              <button onClick={() => api().deselect()}>Deselect All</button>
            </Show>
          </div>

          <div
            ref={ref}
            {...api().getTreeProps()}
            onScroll={virtualizer.handleScroll}
            style={{ height: "400px", overflow: "auto", border: "1px solid #ccc", "border-radius": "4px" }}
          >
            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
              <Index each={virtualizer.getVirtualItems()}>
                {(vi) => {
                  const entry = () => visibleNodes()[vi().index]
                  return (
                    <Show when={entry()}>
                      {(e) => (
                        <div data-index={vi().index} style={virtualizer.getItemStyle(vi())}>
                          <TreeNode node={e().node} indexPath={e().indexPath} api={api} />
                        </div>
                      )}
                    </Show>
                  )
                }}
              </Index>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
