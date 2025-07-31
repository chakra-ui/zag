import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual"
import { flattenedToTree, TreeCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"
import { JSX, useId, useMemo, useRef } from "react"

interface Node {
  id: string
  name: string
  children?: Node[]
}

interface VirtualNode extends Node {
  _virtual: VirtualItem
  children?: VirtualNode[]
}

const collection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
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
        ],
      },
      { id: "panda.config", name: "panda.config.ts" },
      { id: "package.json", name: "package.json" },
      { id: "renovate.json", name: "renovate.json" },
      { id: "readme.md", name: "README.md" },
    ],
  },
})

interface TreeNodeProps {
  node: VirtualNode
  indexPath: number[]
  api: tree.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  const style: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: `${node._virtual.size}px`,
      transform: `translateY(${node._virtual.start}px)`,
    }),
    [node._virtual],
  )

  if (nodeState.isBranch) {
    return (
      <div {...api.getBranchProps(nodeProps)}>
        <div {...mergeProps(api.getBranchControlProps(nodeProps), { style })}>
          <FolderIcon />
          <span {...api.getBranchTextProps(nodeProps)}>{node.name}</span>
          <span {...api.getBranchIndicatorProps(nodeProps)}>
            <ChevronRightIcon />
          </span>
        </div>
        <div {...api.getBranchContentProps(nodeProps)}>
          <div {...api.getBranchIndentGuideProps(nodeProps)} />
          {node.children?.map((childNode, index) => (
            <TreeNode
              key={childNode.id}
              node={{ ...childNode, _virtual: node._virtual }}
              indexPath={[...indexPath, index]}
              api={api}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...mergeProps(api.getItemProps(nodeProps), { style })}>
      <FileIcon /> {node.name}
    </div>
  )
}

export default function Page() {
  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    scrollToNode({ node }) {
      const index = visibleNodes.findIndex((item) => item.id === node.id)
      virtualizer.scrollToIndex(index)
    },
  })
  const api = tree.connect(service, normalizeProps)

  const visibleNodes = useMemo(() => api.getVisibleNodes(), [])

  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: visibleNodes.length,
    overscan: 10,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 30,
    getItemKey(index) {
      return visibleNodes[index].id
    },
  })

  const items: any = virtualizer.getVirtualItems().map((item) => ({
    ...visibleNodes[item.index],
    _virtual: item,
  }))

  const virtualTree = useMemo(() => {
    if (items.length === 0) return
    return flattenedToTree(items, {
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      nodeToChildren: (node) => node.children,
      nodeToChildrenCount: (node) => node.children?.length ?? 0,
      isNodeDisabled: () => false,
    }) as TreeCollection<VirtualNode>
  }, [visibleNodes, virtualizer, items])

  console.log(virtualTree?.rootNode)

  return (
    <main className="tree-view">
      <div ref={scrollRef} style={{ width: "240px", height: "500px", overflow: "auto" }}>
        <div
          {...(mergeProps(api.getRootProps()),
          {
            style: {
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            },
          })}
        >
          <h3 {...api.getLabelProps()}>My Documents</h3>
          <div
            {...mergeProps(api.getTreeProps(), {
              style: { height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" },
            })}
          >
            {virtualTree?.rootNode?.children?.map((node, index) => (
              <TreeNode key={node.id} node={{ ...node, _virtual: node._virtual }} indexPath={[index]} api={api} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
