import {
  type JsonNode,
  JsonNodeHastElement,
  getAccessibleDescription,
  jsonNodeToElement,
  jsonToTree,
} from "@zag-js/json-tree-utils"
import { jsonTreeData } from "@zag-js/shared"
import { JSX } from "preact"

interface KeyNodeProps {
  node: JsonNode
}

const KeyNode = (props: KeyNodeProps) => {
  const { node } = props
  return (
    <>
      <span data-kind="key" data-non-enumerable={node.isNonEnumerable ? "" : undefined}>
        {node.key}
      </span>
      <span data-kind="colon">: </span>
    </>
  )
}

interface ValueNodeProps {
  node: JsonNodeHastElement
}

const ValueNode = (props: ValueNodeProps) => {
  const { node } = props

  // Handle text nodes
  if (node.type === "text") {
    return <>{node.value}</>
  }

  // Handle element nodes
  const Element = node.tagName as keyof JSX.IntrinsicElements
  return (
    <Element
      data-root={node.properties.root ? "" : undefined}
      data-type={node.properties.nodeType}
      data-kind={node.properties.kind}
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

  return (
    <>
      {node.children && node.children.length > 0 ? (
        <div>
          <div aria-label={getAccessibleDescription(node)}>
            {node.key && <KeyNode node={node} />}
            <ValueNode node={jsonNodeToElement(node)} />
          </div>
          <div style={{ paddingLeft: indexPath.length * 4 }}>
            {node.children.map((child, index) => (
              <JsonTreeNode key={child.id} node={child} indexPath={[...indexPath, index]} />
            ))}
          </div>
        </div>
      ) : (
        <div
          aria-label={getAccessibleDescription(node)}
          data-line={line}
          style={{
            ["--line-length" as any]: lineLength,
          }}
        >
          {node.key && <KeyNode node={node} />}
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
