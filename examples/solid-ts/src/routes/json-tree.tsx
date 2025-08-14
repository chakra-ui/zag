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
import { Key } from "@zag-js/solid"
import { Index, JSX } from "solid-js"
import { Dynamic } from "solid-js/web"

interface KeyNodeProps {
  node: JsonNode
}

const KeyNode = (props: KeyNodeProps): JSX.Element => {
  const key = () => keyPathToKey(props.node.keyPath, { excludeRoot: true })
  return (
    <>
      <span data-kind="key" data-non-enumerable={props.node.isNonEnumerable ? "" : undefined}>
        {key()}
      </span>
      <span data-kind="colon">: </span>
    </>
  )
}

interface ValueNodeProps {
  node: JsonNodeHastElement
}

function ValueNode(props: ValueNodeProps): JSX.Element {
  // Handle text nodes
  if (props.node.type === "text") {
    return <>{props.node.value}</>
  }

  // Handle element nodes
  return (
    <Dynamic
      component={props.node.tagName}
      data-root={props.node.properties.root ? "" : undefined}
      data-type={props.node.properties.nodeType}
      data-kind={props.node.properties.kind}
    >
      <Index each={props.node.children}>{(child) => <ValueNode node={child()} />}</Index>
    </Dynamic>
  )
}

interface JsonTreeNodeProps {
  node: JsonNode
  indexPath: number[]
}

function JsonTreeNode(props: JsonTreeNodeProps) {
  const line = () => props.indexPath.reduce((acc, curr) => acc + curr, 1)
  const lineLength = () => props.indexPath.length - 1
  const key = () => (isRootKeyPath(props.node.keyPath) ? "" : keyPathToKey(props.node.keyPath))

  return (
    <>
      {props.node.children && props.node.children.length > 0 ? (
        <div>
          <div aria-label={getAccessibleDescription(props.node)} data-key={props.node.keyPath.join(".")}>
            {key() && <KeyNode node={props.node} />}
            <ValueNode node={jsonNodeToElement(props.node)} />
          </div>
          <div style={{ "padding-left": `${props.indexPath.length * 4}px` }}>
            <Key each={props.node.children} by={(child) => keyPathToId(child.keyPath)}>
              {(child, index) => <JsonTreeNode node={child()} indexPath={[...props.indexPath, index()]} />}
            </Key>
          </div>
        </div>
      ) : (
        <div
          aria-label={getAccessibleDescription(props.node)}
          data-line={line()}
          data-key={props.node.keyPath.join(".")}
          style={{
            "--line-length": lineLength(),
          }}
        >
          {key() && <KeyNode node={props.node} />}
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
