import { normalizeProps, useMachine } from "@zag-js/react"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, ExternalLinkIcon, FileIcon, FolderIcon } from "lucide-react"
import { JSX, useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Node {
  id: string
  name: string
  href?: string
  children?: Node[]
}

const collection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "docs",
        name: "Documentation",
        children: [
          { id: "docs/getting-started", name: "Getting Started", href: "/docs/getting-started" },
          { id: "docs/installation", name: "Installation", href: "/docs/installation" },
          {
            id: "docs/components",
            name: "Components",
            children: [
              { id: "docs/components/accordion", name: "Accordion", href: "/docs/components/accordion" },
              { id: "docs/components/dialog", name: "Dialog", href: "/docs/components/dialog" },
              { id: "docs/components/menu", name: "Menu", href: "/docs/components/menu" },
            ],
          },
        ],
      },
      {
        id: "examples",
        name: "Examples",
        children: [
          { id: "examples/react", name: "React Examples", href: "/examples/react" },
          { id: "examples/vue", name: "Vue Examples", href: "/examples/vue" },
          { id: "examples/solid", name: "Solid Examples", href: "/examples/solid" },
        ],
      },
      {
        id: "external",
        name: "External Links",
        children: [
          { id: "external/github", name: "GitHub Repository", href: "https://github.com/chakra-ui/zag" },
          { id: "external/npm", name: "NPM Package", href: "https://www.npmjs.com/package/@zag-js/core" },
          { id: "external/docs", name: "Official Docs", href: "https://zagjs.com" },
        ],
      },
      { id: "readme.md", name: "README.md", href: "/readme" },
      { id: "license", name: "LICENSE", href: "/license" },
    ],
  },
})

interface TreeNodeProps {
  node: Node
  indexPath: number[]
  api: tree.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props

  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div {...api.getNodeProps(nodeProps)}>
        <div {...api.getCellProps(nodeProps)}>
          {nodeState.isBranch ? <FolderIcon /> : <FileIcon />}
          <span {...api.getNodeTextProps(nodeProps)}>
            {node.href ? (
              <a href={node.href}>
                {node.name}
                {node.href.startsWith("http") && <ExternalLinkIcon size={12} />}
              </a>
            ) : (
              node.name
            )}
          </span>
          {nodeState.isBranch && (
            <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}>
              <ChevronRightIcon />
            </span>
          )}
        </div>
      </div>
      {nodeState.isBranch && (
        <div {...api.getNodeGroupContentProps(nodeProps)}>
          <div {...api.getIndentGuideProps(nodeProps)} />
          {node.children?.map((childNode, index) => (
            <TreeNode key={childNode.id} node={childNode} indexPath={[...indexPath, index]} api={api} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const controls = useControls(treeviewControls)

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    ...controls.context,
  })
  const api = tree.connect(service, normalizeProps)

  return (
    <>
      <main className="tree-view">
        <div {...api.getRootProps()}>
          <h3 {...api.getLabelProps()}>Docs</h3>
          <div {...api.getTreeProps()}>
            {collection.rootNode.children?.map((node, index) => (
              <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
            ))}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
