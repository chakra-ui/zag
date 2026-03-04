import {
  type JsonNode,
  JsonNodeHastElement,
  getAccessibleDescription,
  isRootKeyPath,
  jsonNodeToElement,
  jsonToTree,
  keyPathToId,
  keyPathToKey,
} from "@zag-js/json-tree-utils"
import { jsonTreeData } from "@zag-js/shared"

interface KeyNodeProps {
  node: JsonNode
}
const KeyNode = (props: KeyNodeProps): React.ReactNode => {
  const { node } = props
  const key = keyPathToKey(node.keyPath, { excludeRoot: true })
  return (
    <>
      <span data-kind="key" data-non-enumerable={node.isNonEnumerable ? "" : undefined}>
        {key}
      </span>
      <span data-kind="colon">: </span>
    </>
  )
}

interface ValueNodeProps {
  node: JsonNodeHastElement
}
const ValueNode = (props: ValueNodeProps): React.ReactNode => {
  const { node } = props

  // Handle text nodes
  if (node.type === "text") {
    return <>{node.value}</>
  }

  // Handle element nodes
  const Element = node.tagName
  return (
    <Element
      data-root={node.properties.root ? "" : undefined}
      data-type={node.properties.nodeType}
      data-kind={node.properties.kind}
      suppressHydrationWarning
    >
      {node.children.map((child, index) => (
        <ValueNode key={index} node={child} />
      ))}
    </Element>
  )
}

interface JsonTreeNodeProps {
  node: JsonNode
  indexPath: number[]
}
function JsonTreeNode(props: JsonTreeNodeProps) {
  const { node, indexPath } = props
  const line = indexPath.reduce((acc, curr) => acc + curr, 1)
  const lineLength = indexPath.length - 1
  const key = isRootKeyPath(node.keyPath) ? "" : keyPathToKey(node.keyPath)
  return (
    <>
      {node.children && node.children.length > 0 ? (
        <div>
          <div aria-label={getAccessibleDescription(node)} suppressHydrationWarning data-key={node.keyPath.join(".")}>
            {key && <KeyNode node={node} />}
            <ValueNode node={jsonNodeToElement(node)} />
          </div>
          <div style={{ paddingLeft: indexPath.length * 4 }}>
            {node.children.map((child, index) => (
              <JsonTreeNode key={keyPathToId(child.keyPath)} node={child} indexPath={[...indexPath, index]} />
            ))}
          </div>
        </div>
      ) : (
        <div
          aria-label={getAccessibleDescription(node)}
          suppressHydrationWarning
          data-line={line}
          data-key={node.keyPath.join(".")}
          style={{
            ["--line-length" as any]: lineLength,
          }}
        >
          {key && <KeyNode node={node} />}
          <ValueNode node={jsonNodeToElement(node)} />
        </div>
      )}
    </>
  )
}

export default function JsonTree() {
  return (
    <main style={{ fontFamily: "monospace" }}>
      <style>
        {`
          main * {
            font-family: monospace;
            font-size: 12px;
          }

          [data-kind="error-stack"] {
            display: block;
          }
        `}
      </style>
      <JsonTreeNode node={jsonToTree(jsonTreeData)} indexPath={[0]} />
    </main>
  )
}
