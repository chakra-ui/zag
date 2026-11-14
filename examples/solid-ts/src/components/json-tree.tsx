import type { TreeCollection } from "@zag-js/collection"
import {
  type JsonNode,
  type JsonNodeHastElement,
  type JsonNodePreviewOptions,
  getAccessibleDescription,
  getPreviewOptions,
  getRootNode,
  jsonNodeToElement,
  keyPathToKey,
  nodeToString,
  nodeToValue,
} from "@zag-js/json-tree-utils"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tree from "@zag-js/tree-view"
import styles from "@styles/json-tree-view.module.css"
import { ChevronRightIcon } from "lucide-solid"
import { createMemo, createUniqueId, For, Show, type Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Dynamic } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

const DEFAULT_EXPANDED_DEPTH = 2

function getBranchValues(collection: TreeCollection<JsonNode>, depth: number) {
  const values: string[] = []
  collection.visit({
    onEnter: (node, indexPath) => {
      if (indexPath.length === 0) return
      if (collection.isBranchNode(node) && indexPath.length <= depth) {
        values.push(collection.getNodeValue(node))
      }
    },
  })
  return values
}

function KeyNode(props: { node: JsonNode }): JSX.Element {
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

function ValueNode(props: { node: JsonNodeHastElement }): JSX.Element {
  if (props.node.type === "text") {
    return <>{props.node.value}</>
  }

  return (
    <Dynamic
      component={props.node.tagName}
      data-root={props.node.properties.root ? "" : undefined}
      data-type={props.node.properties.nodeType}
      data-kind={props.node.properties.kind}
    >
      <For keyed={false} each={props.node.children}>
        {(child) => <ValueNode node={child()} />}
      </For>
    </Dynamic>
  )
}

interface JsonTreeNodeProps {
  api: Accessor<tree.Api>
  indexPath: number[]
  node: JsonNode
  previewOptions: JsonNodePreviewOptions
}

function JsonTreeNode(props: JsonTreeNodeProps): JSX.Element {
  const { api, indexPath, node, previewOptions } = props
  const nodeProps = { indexPath, node }
  const nodeState = createMemo(() => api().getNodeState(nodeProps))
  const key = keyPathToKey(node.keyPath, { excludeRoot: true })
  const valueNode = jsonNodeToElement(node, previewOptions)

  const contentProps = () => ({
    "aria-label": getAccessibleDescription(node),
    class: styles.node,
    style: { "--depth": nodeState().depth },
  })

  const nodeElProps = createMemo(() => mergeProps(api().getNodeProps(nodeProps), contentProps()))

  return (
    <div {...api().getNodeGroupProps(nodeProps)} class={styles.nodeGroup}>
      <div {...nodeElProps()}>
        <div {...api().getNodeCellProps(nodeProps)} class={styles.cell}>
          <Show when={nodeState().isBranch} fallback={<span class={styles.chevronSpacer} aria-hidden="true" />}>
            <span {...api().getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} class={styles.chevron}>
              <ChevronRightIcon size={14} />
            </span>
          </Show>
          <Show when={key}>
            <KeyNode node={node} />
          </Show>
          <ValueNode node={valueNode} />
        </div>
      </div>
      <Show when={nodeState().isBranch}>
        <div {...api().getNodeGroupContentProps(nodeProps)} class={styles.groupContent}>
          <div {...api().getIndentGuideProps(nodeProps)} class={styles.indentGuide} />
          <For each={node.children}>
            {(child, index) => (
              <JsonTreeNode
                api={api}
                node={child}
                indexPath={[...indexPath, index()]}
                previewOptions={previewOptions}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

interface JsonTreeProps {
  data: unknown
  label: string
  hint: string
  options?: Partial<JsonNodePreviewOptions>
}

export function JsonTree(props: JsonTreeProps) {
  const previewOptions = getPreviewOptions(props.options)

  const collection = tree.collection<JsonNode>({
    nodeToValue,
    nodeToString,
    rootNode: getRootNode(props.data, previewOptions),
  })

  const service = useMachine(tree.machine, {
    id: createUniqueId(),
    collection,
    defaultExpandedValue: getBranchValues(collection, DEFAULT_EXPANDED_DEPTH),
    typeahead: false,
  })

  const api = createMemo(() => tree.connect(service, normalizeProps))

  return (
    <>
      <div {...api().getRootProps()} class={styles.root}>
        <p class={styles.hint}>{props.hint}</p>

        <div class={styles.toolbar}>
          <button type="button" class={styles.button} onClick={() => api().collapse()}>
            Collapse all
          </button>
          <button type="button" class={styles.button} onClick={() => api().expand()}>
            Expand all
          </button>
        </div>

        <div class={styles.panel}>
          <div class={styles.viewport}>
            <div
              {...mergeProps(api().getTreeProps(), { "aria-label": props.label, "aria-labelledby": undefined })}
              class={styles.tree}
            >
              <For each={collection.rootNode.children}>
                {(node, index) => (
                  <JsonTreeNode api={api} node={node} indexPath={[index()]} previewOptions={previewOptions} />
                )}
              </For>
            </div>
          </div>
        </div>
      </div>

      <Toolbar>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
