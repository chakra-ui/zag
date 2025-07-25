<template>
  <main class="json-tree-container">
    <style scoped>
      .json-tree-container * {
        font-family: monospace;
        font-size: 12px;
      }

      :deep([data-kind="error-stack"]) {
        display: block;
      }
    </style>
    <JsonTreeNode :node="treeData" :index-path="[0]" />
  </main>
</template>

<script setup lang="ts">
import { defineComponent, h } from "vue"
import {
  type JsonNode,
  type JsonNodeHastElement,
  getAccessibleDescription,
  jsonNodeToElement,
  jsonToTree,
} from "@zag-js/json-tree-utils"
import { jsonTreeData } from "@zag-js/shared"

const KeyNode = defineComponent({
  props: {
    node: {
      type: Object as () => JsonNode,
      required: true,
    },
  },
  render() {
    return [
      h(
        "span",
        {
          "data-kind": "key",
          "data-non-enumerable": this.node.isNonEnumerable ? "" : undefined,
        },
        this.node.key,
      ),
      h("span", { "data-kind": "colon" }, ": "),
    ]
  },
})

const ValueNode = defineComponent({
  props: {
    node: {
      type: Object as () => JsonNodeHastElement,
      required: true,
    },
  },
  render() {
    // Handle text nodes
    if (this.node.type === "text") {
      return this.node.value
    }

    // Handle element nodes
    return h(
      this.node.tagName,
      {
        "data-root": this.node.properties.root ? "" : undefined,
        "data-type": this.node.properties.nodeType,
        "data-kind": this.node.properties.kind,
      },
      this.node.children.map((child, index) => h(ValueNode, { key: index, node: child })),
    )
  },
})

const JsonTreeNode = defineComponent({
  props: {
    node: {
      type: Object as () => JsonNode,
      required: true,
    },
    indexPath: {
      type: Array as () => number[],
      required: true,
    },
  },
  computed: {
    line() {
      return this.indexPath.reduce((acc, curr) => acc + curr, 1)
    },
    lineLength() {
      return this.indexPath.length - 1
    },
  },
  render() {
    if (this.node.children && this.node.children.length > 0) {
      return h("div", [
        h("div", { "aria-label": getAccessibleDescription(this.node) }, [
          this.node.key && h(KeyNode, { node: this.node }),
          h(ValueNode, { node: jsonNodeToElement(this.node) }),
        ]),
        h(
          "div",
          { style: { paddingLeft: `${this.indexPath.length * 4}px` } },
          this.node.children.map((child, index) =>
            h(JsonTreeNode, {
              key: child.id,
              node: child,
              indexPath: [...this.indexPath, index],
            }),
          ),
        ),
      ])
    } else {
      return h(
        "div",
        {
          "aria-label": getAccessibleDescription(this.node),
          "data-line": this.line,
          style: {
            "--line-length": this.lineLength,
          },
        },
        [this.node.key && h(KeyNode, { node: this.node }), h(ValueNode, { node: jsonNodeToElement(this.node) })],
      )
    }
  },
})

const treeData = jsonToTree(jsonTreeData)
</script>
