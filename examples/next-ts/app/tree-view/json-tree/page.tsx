"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
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
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { jsonTreeData } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import styles from "@styles/json-tree-view.module.css"
import { ChevronRightIcon } from "lucide-react"
import { type JSX, useId, useMemo } from "react"

const DEFAULT_EXPANDED_DEPTH = 2

const previewOptions = getPreviewOptions()

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

interface KeyNodeProps {
  node: JsonNode
}

function KeyNode(props: KeyNodeProps): JSX.Element {
  const { node } = props
  const key = keyPathToKey(node.keyPath, { excludeRoot: true })

  return (
    <>
      <span data-kind="key" suppressHydrationWarning data-non-enumerable={node.isNonEnumerable ? "" : undefined}>
        {key}
      </span>
      <span data-kind="colon">: </span>
    </>
  )
}

interface ValueNodeProps {
  node: JsonNodeHastElement
}

function ValueNode(props: ValueNodeProps): JSX.Element {
  const { node } = props

  if (node.type === "text") {
    return <>{node.value}</>
  }

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
  api: tree.Api
  indexPath: number[]
  node: JsonNode
  previewOptions: JsonNodePreviewOptions
}

function JsonTreeNode(props: JsonTreeNodeProps): JSX.Element {
  const { api, indexPath, node, previewOptions } = props
  const nodeProps = { indexPath, node }
  const nodeState = api.getNodeState(nodeProps)
  const key = keyPathToKey(node.keyPath, { excludeRoot: true })
  const valueNode = useMemo(() => jsonNodeToElement(node, previewOptions), [node, previewOptions])

  const contentProps = {
    "aria-label": getAccessibleDescription(node),
    suppressHydrationWarning: true,
    className: styles.node,
    style: { ["--depth" as string]: nodeState.depth },
  }

  if (nodeState.isBranch) {
    return (
      <div {...api.getNodeGroupProps(nodeProps)} className={styles.nodeGroup}>
        <div {...mergeProps(api.getNodeProps(nodeProps), contentProps)}>
          <div {...api.getNodeCellProps(nodeProps)} className={styles.cell}>
            <span {...api.getNodeIndicatorProps({ ...nodeProps, type: "expanded" })} className={styles.chevron}>
              <ChevronRightIcon size={14} />
            </span>
            {key ? <KeyNode node={node} /> : null}
            <ValueNode node={valueNode} />
          </div>
        </div>
        <div {...api.getNodeGroupContentProps(nodeProps)} className={styles.groupContent}>
          <div {...api.getIndentGuideProps(nodeProps)} className={styles.indentGuide} />
          {node.children?.map((child, index) => (
            <JsonTreeNode
              key={nodeToValue(child)}
              api={api}
              node={child}
              indexPath={[...indexPath, index]}
              previewOptions={previewOptions}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...api.getNodeGroupProps(nodeProps)} className={styles.nodeGroup}>
      <div {...mergeProps(api.getNodeProps(nodeProps), contentProps)}>
        <div {...api.getNodeCellProps(nodeProps)} className={styles.cell}>
          <span className={styles.chevronSpacer} aria-hidden="true" />
          {key ? <KeyNode node={node} /> : null}
          <ValueNode node={valueNode} />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const collection = useMemo(
    () =>
      tree.collection<JsonNode>({
        nodeToValue,
        nodeToString,
        rootNode: getRootNode(jsonTreeData, previewOptions),
      }),
    [],
  )

  const defaultExpandedValue = useMemo(() => getBranchValues(collection, DEFAULT_EXPANDED_DEPTH), [collection])

  const service = useMachine(tree.machine, {
    id: useId(),
    collection,
    defaultExpandedValue,
    typeahead: false,
  })

  const api = tree.connect(service, normalizeProps)

  return (
    <>
      <main className={styles.root}>
        <div {...api.getRootProps()}>
          <div className={styles.header}>
            <h3 {...api.getLabelProps()}>JSON Tree</h3>
            <p>
              Tree view wired to <code>@zag-js/json-tree-utils</code> for parsing, previews, and accessible labels.
            </p>
          </div>

          <div className={styles.toolbar}>
            <button type="button" className={styles.button} onClick={() => api.collapse()}>
              Collapse all
            </button>
            <button type="button" className={styles.button} onClick={() => api.expand()}>
              Expand all
            </button>
          </div>

          <div className={styles.panel}>
            <div className={styles.viewport}>
              <div {...api.getTreeProps()} className={styles.tree}>
                {collection.rootNode.children?.map((node, index) => (
                  <JsonTreeNode
                    key={nodeToValue(node)}
                    api={api}
                    node={node}
                    indexPath={[index]}
                    previewOptions={previewOptions}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
