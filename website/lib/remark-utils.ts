import { visit } from "unist-util-visit"
import { h } from "hastscript"

function isDirective(node: { type: string }) {
  return (
    node.type === "textDirective" ||
    node.type === "leafDirective" ||
    node.type === "containerDirective"
  )
}

export function remarkAdmonition() {
  return function parse(tree) {
    visit(tree, (node) => {
      if (isDirective(node)) {
        const data = node.data || (node.data = {})
        data.hName = "Admonition"
        const element = h(node.name, node.attributes) as any
        data.hProperties = {
          ...element.properties,
          className: "adminition",
          "data-type": node.name,
        }
      }
    })
  }
}
