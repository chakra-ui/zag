import { normalizeProps, useMachine } from "@zag-js/react"
import * as tree from "@zag-js/tree-view"
import { useId, useState } from "react"
import {
  LuChevronRight,
  LuFile,
  LuFolder,
  LuLoaderCircle,
} from "react-icons/lu"
import styles from "../../styles/machines/tree-view.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

interface Node {
  id: string
  name: string
  children?: Node[]
  childrenCount?: number
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
      { id: "package.json", name: "package.json" },
      { id: "readme.md", name: "README.md" },
    ],
  },
})

type TreeProps = Partial<tree.Props<Node>>

function useTree(props: TreeProps = {}) {
  const service = useMachine(tree.machine as tree.Machine<Node>, {
    id: useId(),
    collection,
    ...props,
  })
  return tree.connect(service, normalizeProps)
}

interface NodeViewProps {
  node: Node
  indexPath: number[]
  api: tree.Api
  checkbox?: boolean
  guide?: boolean
}

function NodeView(props: NodeViewProps) {
  const { node, indexPath, api } = props
  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)

  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div className={styles.Node} {...api.getNodeProps(nodeProps)}>
        <div className={styles.Cell} {...api.getNodeCellProps(nodeProps)}>
          {nodeState.isBranch ? (
            <span
              className={styles.NodeIndicator}
              {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })}
            >
              <LuChevronRight />
            </span>
          ) : (
            <span className={styles.Spacer} />
          )}
          {props.checkbox && (
            <span
              className={styles.Checkbox}
              {...api.getNodeCheckboxProps(nodeProps)}
            >
              {nodeState.checked === true
                ? "✓"
                : nodeState.checked === "indeterminate"
                  ? "–"
                  : null}
            </span>
          )}
          {nodeState.isBranch ? <LuFolder /> : <LuFile />}
          {nodeState.renaming ? (
            <input
              className={styles.RenameInput}
              {...api.getNodeRenameInputProps(nodeProps)}
            />
          ) : (
            <span
              className={styles.NodeText}
              {...api.getNodeTextProps(nodeProps)}
            >
              {node.name}
            </span>
          )}
          {nodeState.loading && (
            <LuLoaderCircle className={styles.Spinner} aria-hidden />
          )}
        </div>
      </div>
      {nodeState.isBranch && (
        <div
          className={styles.NodeGroupContent}
          {...api.getNodeGroupContentProps(nodeProps)}
        >
          {props.guide !== false && (
            <div
              className={styles.IndentGuide}
              {...api.getIndentGuideProps(nodeProps)}
            />
          )}
          {node.children?.map((child, index) => (
            <NodeView
              key={child.id}
              {...props}
              node={child}
              indexPath={[...indexPath, index]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ViewProps {
  api: tree.Api
  checkbox?: boolean
  guide?: boolean
  label?: string
}

function View(props: ViewProps) {
  const { api, ...rest } = props
  const root = api.collection.rootNode as Node
  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <h3 className={styles.Label} {...api.getLabelProps()}>
        {props.label ?? "My Documents"}
      </h3>
      <div className={styles.Tree} {...api.getTreeProps()}>
        {root.children?.map((node, index) => (
          <NodeView
            key={node.id}
            node={node}
            indexPath={[index]}
            api={api}
            {...rest}
          />
        ))}
      </div>
    </div>
  )
}

const names = (nodes: Node[]) => show(nodes.map((node) => node.name))

export function TreeViewBasic() {
  const api = useTree()
  return <View api={api} />
}

export function TreeViewExpandCollapse() {
  const api = useTree()
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => api.expand()}>Expand all</Ghost>
        <Ghost onClick={() => api.collapse()}>Collapse all</Ghost>
        <Ghost
          onClick={() => api.expand(["node_modules", "node_modules/@types"])}
        >
          Expand @types
        </Ghost>
      </Row>
      <View api={api} />
    </Stack>
  )
}

export function TreeViewMultiple() {
  const [value, setValue] = useState<string[]>([])
  const api = useTree({
    selectionMode: "multiple",
    defaultExpandedValue: ["src"],
    onSelectionChange: (details) => setValue(details.selectedValue),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="selected (⌘/Shift + click)" value={show(value)} />
    </Stack>
  )
}

export function TreeViewDefaultExpanded() {
  const api = useTree({
    defaultExpandedValue: ["node_modules", "node_modules/@types"],
  })
  return <View api={api} />
}

export function TreeViewDefaultSelected() {
  const api = useTree({
    defaultExpandedValue: ["node_modules"],
    defaultSelectedValue: ["node_modules/pandacss"],
  })
  return <View api={api} />
}

export function TreeViewControlled() {
  const [expandedValue, setExpandedValue] = useState<string[]>(["src"])
  const [selectedValue, setSelectedValue] = useState<string[]>([])
  const api = useTree({
    expandedValue,
    selectedValue,
    onExpandedChange: (details) => setExpandedValue(details.expandedValue),
    onSelectionChange: (details) => setSelectedValue(details.selectedValue),
  })
  return (
    <Stack>
      <Row>
        <Ghost
          onClick={() => {
            setExpandedValue(["src"])
            setSelectedValue(["src/index.ts"])
          }}
        >
          Select index.ts
        </Ghost>
        <Ghost onClick={() => setExpandedValue([])}>Collapse all</Ghost>
      </Row>
      <View api={api} />
      <Row>
        <Log label="expanded" value={show(expandedValue)} />
        <Log label="selected" value={show(selectedValue)} />
      </Row>
    </Stack>
  )
}

export function TreeViewIndentGuide() {
  const api = useTree({
    defaultExpandedValue: ["node_modules", "node_modules/@types", "src"],
  })
  return <View api={api} />
}

export function TreeViewSelectionChange() {
  const [value, setValue] = useState("—")
  const api = useTree({
    onSelectionChange: (details) => setValue(names(details.selectedNodes)),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="selectedNodes" value={value} />
    </Stack>
  )
}

export function TreeViewExpandedChange() {
  const [value, setValue] = useState("—")
  const api = useTree({
    onExpandedChange: (details) => setValue(names(details.expandedNodes)),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="expandedNodes" value={value} />
    </Stack>
  )
}

export function TreeViewChecked() {
  const [focused, setFocused] = useState<string | null>(null)
  const [checked, setChecked] = useState<string[]>([])
  const api = useTree({
    defaultExpandedValue: ["src"],
    onFocusChange: (details) => setFocused(details.focusedValue),
    onCheckedChange: (details) => setChecked(details.checkedValue),
  })
  return (
    <Stack>
      <View api={api} checkbox />
      <Row>
        <Log label="focused" value={show(focused)} />
        <Log label="checked" value={show(checked)} />
      </Row>
    </Stack>
  )
}

export function TreeViewProgrammatic() {
  const api = useTree()
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => api.expand(["node_modules"])}>expand</Ghost>
        <Ghost onClick={() => api.collapse(["node_modules"])}>collapse</Ghost>
        <Ghost onClick={() => api.select(["node_modules/pandacss"])}>
          select panda
        </Ghost>
        <Ghost onClick={() => api.deselect(["node_modules/pandacss"])}>
          deselect
        </Ghost>
        <Ghost onClick={() => api.focus("src")}>focus src</Ghost>
      </Row>
      <View api={api} />
    </Stack>
  )
}

export function TreeViewNoExpandOnClick() {
  const api = useTree({ expandOnClick: false })
  return (
    <Stack>
      <View api={api} />
      <Log label="expand with" value="the chevron or arrow keys" />
    </Stack>
  )
}

export function TreeViewNoTypeahead() {
  const api = useTree({ typeahead: false })
  return <View api={api} />
}

const files: Record<string, Node[]> = {
  node_modules: [
    { id: "node_modules/zag-js", name: "zag-js" },
    { id: "node_modules/pandacss", name: "panda" },
    { id: "node_modules/@types", name: "@types", childrenCount: 2 },
  ],
  "node_modules/node_modules/@types": [
    { id: "node_modules/@types/react", name: "react" },
    { id: "node_modules/@types/react-dom", name: "react-dom" },
  ],
  src: [
    { id: "src/app.tsx", name: "app.tsx" },
    { id: "src/index.ts", name: "index.ts" },
  ],
}

const asyncCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      { id: "node_modules", name: "node_modules", childrenCount: 3 },
      { id: "src", name: "src", childrenCount: 2 },
      { id: "package.json", name: "package.json" },
    ],
  },
})

export function TreeViewLazy() {
  const [items, setItems] = useState(asyncCollection)
  const [loaded, setLoaded] = useState(0)
  const api = useTree({
    collection: items,
    loadChildren: (details) =>
      new Promise((resolve) => {
        const key = details.valuePath.join("/")
        setTimeout(() => resolve(files[key] ?? []), 800)
      }),
    onLoadChildrenComplete: (details) => {
      setItems(details.collection)
      setLoaded((n) => n + 1)
    },
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="loaded" value={`${loaded} branches`} />
    </Stack>
  )
}

const renameCollection = tree.collection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "docs",
        name: "docs",
        children: [
          { id: "docs/intro.md", name: "intro.md" },
          { id: "docs/setup.md", name: "setup.md" },
        ],
      },
      { id: "README.md", name: "README.md" },
      { id: "package.json", name: "package.json" },
    ],
  },
})

function useRenameTree(props: TreeProps = {}) {
  const [items, setItems] = useState(renameCollection)
  return useTree({
    collection: items,
    defaultExpandedValue: ["docs"],
    canRename: () => true,
    onRenameComplete: (details) => {
      const node = items.at(details.indexPath)
      if (!node) return
      setItems(
        items.replace(details.indexPath, { ...node, name: details.label }),
      )
    },
    ...props,
  })
}

export function TreeViewRename() {
  const api = useRenameTree()
  return (
    <Stack>
      <View api={api} />
      <Row>
        <Log label="rename" value="focus a node and press F2" />
        <Ghost onClick={() => api.startRenaming("README.md")}>
          Rename README.md
        </Ghost>
      </Row>
    </Stack>
  )
}

export function TreeViewCanRename() {
  const api = useRenameTree({ canRename: (node) => !node.children })
  return (
    <Stack>
      <View api={api} />
      <Log label="F2 renames" value="files only" />
    </Stack>
  )
}

export function TreeViewBeforeRename() {
  const [result, setResult] = useState("—")
  const api = useRenameTree({
    onBeforeRename: (details) => {
      const ok = !details.label.includes(" ")
      setResult(ok ? `accepted "${details.label}"` : "rejected: no spaces")
      return ok
    },
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="onBeforeRename" value={result} />
    </Stack>
  )
}

export function TreeViewRenameStart() {
  const [value, setValue] = useState("—")
  const api = useRenameTree({
    onRenameStart: (details) => setValue(details.node.name),
  })
  return (
    <Stack>
      <View api={api} />
      <Log label="onRenameStart" value={value} />
    </Stack>
  )
}
