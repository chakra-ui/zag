import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import * as dnd from "@zag-js/dnd"
import { ChevronRightIcon, FileIcon, FolderIcon, GripVerticalIcon } from "lucide-react"
import { JSX, useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

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
  treeApi: tree.Api
  dndApi: dnd.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, treeApi, dndApi } = props
  const nodeProps = { indexPath, node }
  const nodeState = treeApi.getNodeState(nodeProps)

  return (
    <div {...treeApi.getNodeGroupProps(nodeProps)}>
      <div {...mergeProps(treeApi.getNodeProps(nodeProps), dndApi.getDropTargetProps({ value: node.id }))}>
        <div
          {...dndApi.getDropIndicatorProps({ value: node.id, placement: "before" })}
          style={{ ["--depth" as string]: nodeState.depth }}
        />

        <div {...treeApi.getCellProps(nodeProps)} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span {...dndApi.getDragHandleProps({ value: node.id })}>
            <GripVerticalIcon size={14} />
          </span>
          {nodeState.isBranch && (
            <span {...treeApi.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon size={14} />
            </span>
          )}
          {nodeState.isBranch ? <FolderIcon size={14} /> : <FileIcon size={14} />}
          <span {...treeApi.getNodeTextProps(nodeProps)}>{node.name}</span>
        </div>

        <div
          {...dndApi.getDropIndicatorProps({ value: node.id, placement: "after" })}
          style={{ ["--depth" as string]: nodeState.depth }}
        />
      </div>

      {nodeState.isBranch && (
        <div {...treeApi.getNodeGroupContentProps(nodeProps)}>
          <div {...treeApi.getIndentGuideProps(nodeProps)} />
          {node.children?.map((childNode, index) => (
            <TreeNode
              key={childNode.id}
              node={childNode}
              indexPath={[...indexPath, index]}
              treeApi={treeApi}
              dndApi={dndApi}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [collection, setCollection] = useState(() => createCollection(initialData))
  const [expandedValue, setExpandedValue] = useState<string[]>(["src", "public"])

  const treeService = useMachine(tree.machine, {
    id: useId(),
    collection,
    expandedValue,
    onExpandedChange(details) {
      setExpandedValue(details.expandedValue)
    },
  })
  const treeApi = tree.connect(treeService, normalizeProps)

  const dndService = useMachine(dnd.machine, {
    id: useId(),
    dropPlacements: ["before", "after", "on"],
    getValueText(value) {
      return collection.stringify(value) ?? value
    },
    canDrop(source, target, placement) {
      if (source === target && placement === "on") return false
      const sourcePath = collection.getIndexPath(source)
      const targetPath = collection.getIndexPath(target)
      if (sourcePath && targetPath) {
        return !collection.contains(sourcePath, targetPath)
      }
      return true
    },
    onDrop({ source, target, placement }) {
      const sourcePath = collection.getIndexPath(source)
      const targetPath = collection.getIndexPath(target)
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

      const newCollection = collection.move([sourcePath], toPath)
      setCollection(newCollection)
    },
  })
  const dndApi = dnd.connect(dndService, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...treeApi.getRootProps()}>
          <h3 {...treeApi.getLabelProps()}>File Explorer (Drag & Drop)</h3>
          <div {...dndApi.getRootProps()}>
            <div {...treeApi.getTreeProps()}>
              {collection.rootNode.children?.map((node, index) => (
                <TreeNode key={node.id} node={node} indexPath={[index]} treeApi={treeApi} dndApi={dndApi} />
              ))}
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
