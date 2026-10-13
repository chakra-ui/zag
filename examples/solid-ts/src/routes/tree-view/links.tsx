import { normalizeProps, useMachine } from "@zag-js/solid"
import { treeviewControls } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon, ExternalLinkIcon, FileIcon, FolderIcon } from "lucide-solid"
import { Accessor, createMemo, createUniqueId, Index, JSX, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/tree-view.css"

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
  api: Accessor<tree.Api>
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath, api } = props
  const nodeProps = { indexPath, node }
  const nodeState = createMemo(() => api().getNodeState(nodeProps))

  return (
    <div {...api().getNodeGroupProps(nodeProps)}>
      <div {...api().getNodeProps(nodeProps)}>
        <div {...api().getNodeCellProps(nodeProps)}>
          <Show when={nodeState().isBranch} fallback={<FileIcon />}>
            <FolderIcon />
          </Show>
          <span {...api().getNodeTextProps(nodeProps)}>
            <Show when={node.href} fallback={node.name}>
              {(href) => (
                <a href={href()}>
                  {node.name}
                  <Show when={href().startsWith("http")}>
                    <ExternalLinkIcon size={12} />
                  </Show>
                </a>
              )}
            </Show>
          </span>
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
  const controls = useControls(treeviewControls)

  const service = useMachine(
    tree.machine,
    controls.mergeProps<tree.Props<Node>>({
      id: createUniqueId(),
      collection,
    }),
  )
  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <>
      <main class="tree-view">
        <div {...api().getRootProps()}>
          <h3 {...api().getLabelProps()}>Docs</h3>
          <div {...api().getTreeProps()}>
            <Index each={collection.rootNode.children}>
              {(node, index) => <TreeNode node={node()} indexPath={[index]} api={api} />}
            </Index>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
