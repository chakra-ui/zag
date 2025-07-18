import {
  type JsonNode,
  JsonNodeHastElement,
  getAccessibleDescription,
  jsonNodeToElement,
  jsonToTree,
} from "@zag-js/json-tree-utils"
import { jsonTreeData } from "@zag-js/shared"
import { For, JSX } from "solid-js"

interface KeyNodeProps {
  node: JsonNode
}

const KeyNode = (props: KeyNodeProps) => {
  return (
    <>
      <span data-kind="key" data-non-enumerable={props.node.isNonEnumerable ? "" : undefined}>
        {props.node.key}
      </span>
      <span data-kind="colon">: </span>
    </>
  )
}

interface ValueNodeProps {
  node: JsonNodeHastElement
}

const ValueNode = (props: ValueNodeProps): JSX.Element => {
  // Handle text nodes
  if (props.node.type === "text") {
    return <>{props.node.value}</>
  }

  // Handle element nodes
  const Element = props.node.tagName as keyof JSX.IntrinsicElements
  return (
    <Element
      data-root={props.node.properties.root ? "" : undefined}
      data-type={props.node.properties.nodeType}
      data-kind={props.node.properties.kind}
    >
      <For each={props.node.children}>{(child) => <ValueNode node={child} />}</For>
    </Element>
  )
}

interface JsonTreeNodeProps {
  node: JsonNode
  indexPath: number[]
}

function JsonTreeNode(props: JsonTreeNodeProps) {
  const line = () => props.indexPath.reduce((acc, curr) => acc + curr, 1)
  const lineLength = () => props.indexPath.length - 1

  return (
    <>
      {props.node.children && props.node.children.length > 0 ? (
        <div>
          <div aria-label={getAccessibleDescription(props.node)}>
            {props.node.key && <KeyNode node={props.node} />}
            <ValueNode node={jsonNodeToElement(props.node)} />
          </div>
          <div style={{ "padding-left": `${props.indexPath.length * 4}px` }}>
            <For each={props.node.children}>
              {(child, index) => <JsonTreeNode node={child} indexPath={[...props.indexPath, index()]} />}
            </For>
          </div>
        </div>
      ) : (
        <div
          aria-label={getAccessibleDescription(props.node)}
          data-line={line()}
          style={{
            "--line-length": lineLength(),
          }}
        >
          {props.node.key && <KeyNode node={props.node} />}
          <ValueNode node={jsonNodeToElement(props.node)} />
        </div>
      )}
    </>
  )
}

export default function JsonTree() {
  return (
    <main style={{ "font-family": "monospace" }}>
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
