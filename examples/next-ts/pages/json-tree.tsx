import {
  type JsonNode,
  JsonNodeElement,
  getAccessibleDescription,
  jsonNodeToElement,
  jsonToTree,
} from "@zag-js/json-tree-utils"

interface KeyNodeProps {
  node: JsonNode
}
const KeyNode = (props: KeyNodeProps): React.ReactNode => {
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
  node: JsonNodeElement
}
const ValueNode = (props: ValueNodeProps): React.ReactNode => {
  const { node } = props
  return (
    <span data-type={node.props.nodeType} data-kind={node.props.kind} suppressHydrationWarning>
      {Array.isArray(node.props.children)
        ? node.props.children.map((child, index) => <ValueNode key={index} node={child} />)
        : node.props.children}
    </span>
  )
}

interface JsonTreeNodeProps {
  node: JsonNode
  indexPath: number[]
}
function JsonTreeNode(props: JsonTreeNodeProps) {
  const { node, indexPath } = props
  return (
    <>
      {node.children && node.children.length > 0 ? (
        <div>
          <div aria-label={getAccessibleDescription(node)} suppressHydrationWarning>
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
        <div aria-label={getAccessibleDescription(node)} suppressHydrationWarning>
          <span>
            {node.key && <KeyNode node={node} />}
            <ValueNode node={jsonNodeToElement(node)} />
          </span>
        </div>
      )}
    </>
  )
}

const testArray = [1, 2, 3, 4, 5]
Object.defineProperties(testArray, {
  customProperty: { value: "custom value", enumerable: false, writable: false },
  anotherProperty: { value: 42, enumerable: false, writable: false },
})

const sparseArray = new Array(10)
sparseArray[9] = 9

class TestClass {
  name: string
  constructor() {
    this.name = "Test Class"
  }
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
      <JsonTreeNode
        node={jsonToTree({
          name: "John Doe",
          age: 30,
          email: "john.doe@example.com",
          tags: ["tag1", "tag2", "tag3"],
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zip: "12345",
          },
          testArray,
          sparseArray,
          map: new Map([
            ["key1", "value1"],
            ["key2", "value2"],
          ]),
          //   err: new Error("There was an error"),
          testClass: new TestClass(),
          file: new File(["sdfdfsd"], "test.txt"),
          elements: ["svelte", 123, false, true, null, undefined, 456n],
          functions: [
            function sum(a, b) {
              return a + b
            },
            async (promises) => await Promise.all(promises),
            function* generator(a) {
              while (a--) {
                yield a
              }
            },
          ],
          set: new Set([1, 2, 3, 4, 5]),
          regex: /^[a-z0-9]+/g,
          case_insensitive: /^(?:[a-z0-9]+)foo.*?/i,
          date: new Date(),
          symbol: Symbol("test"),
          bigint: BigInt(123),
          null: null,
        })}
        indexPath={[0]}
      />
    </main>
  )
}
