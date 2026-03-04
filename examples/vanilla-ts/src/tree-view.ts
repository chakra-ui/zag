import * as tree from "@zag-js/tree-view"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

interface Node {
  id: string
  name: string
  children?: Node[]
}

const treeData: Node = {
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
    { id: "panda.config", name: "panda.config.ts" },
    { id: "package.json", name: "package.json" },
    { id: "renovate.json", name: "renovate.json" },
    { id: "readme.md", name: "README.md" },
  ],
}

export class TreeView extends Component<tree.Props, tree.Api> {
  private collection: ReturnType<typeof tree.collection<Node>>

  constructor(rootEl: HTMLElement | null, props: Omit<tree.Props, "collection">) {
    const collection = tree.collection<Node>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      rootNode: treeData,
    })

    super(rootEl, { ...props, collection } as tree.Props)
    this.collection = collection
  }

  initMachine(props: tree.Props) {
    return new VanillaMachine(tree.machine, {
      ...props,
    })
  }

  initApi() {
    return tree.connect(this.machine.service, normalizeProps)
  }

  private createFolderIcon(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "16")
    svg.setAttribute("height", "16")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("stroke", "currentColor")
    svg.setAttribute("stroke-width", "2")
    svg.innerHTML = `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>`
    return svg
  }

  private createFileIcon(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "16")
    svg.setAttribute("height", "16")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("stroke", "currentColor")
    svg.setAttribute("stroke-width", "2")
    svg.innerHTML = `<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline>`
    return svg
  }

  private createChevronIcon(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "16")
    svg.setAttribute("height", "16")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("stroke", "currentColor")
    svg.setAttribute("stroke-width", "2")
    svg.innerHTML = `<polyline points="9 18 15 12 9 6"></polyline>`
    return svg
  }

  private renderNode(container: HTMLElement, node: Node, indexPath: number[]) {
    const nodeProps = { indexPath, node }
    const nodeState = this.api.getNodeState(nodeProps)

    if (nodeState.isBranch) {
      this.renderBranch(container, node, indexPath, nodeProps)
    } else {
      this.renderItem(container, node, nodeProps)
    }
  }

  private renderBranch(
    container: HTMLElement,
    node: Node,
    indexPath: number[],
    nodeProps: { indexPath: number[]; node: Node },
  ) {
    const branchEl = this.doc.createElement("div")
    this.spreadProps(branchEl, this.api.getBranchProps(nodeProps))

    // Branch control
    const controlEl = this.doc.createElement("div")
    this.spreadProps(controlEl, this.api.getBranchControlProps(nodeProps))

    controlEl.appendChild(this.createFolderIcon())

    const textEl = this.doc.createElement("span")
    textEl.textContent = node.name
    this.spreadProps(textEl, this.api.getBranchTextProps(nodeProps))
    controlEl.appendChild(textEl)

    const indicatorEl = this.doc.createElement("span")
    indicatorEl.appendChild(this.createChevronIcon())
    this.spreadProps(indicatorEl, this.api.getBranchIndicatorProps(nodeProps))
    controlEl.appendChild(indicatorEl)

    branchEl.appendChild(controlEl)

    // Branch content (children)
    const contentEl = this.doc.createElement("div")
    this.spreadProps(contentEl, this.api.getBranchContentProps(nodeProps))

    const indentGuideEl = this.doc.createElement("div")
    this.spreadProps(indentGuideEl, this.api.getBranchIndentGuideProps(nodeProps))
    contentEl.appendChild(indentGuideEl)

    // Render children
    node.children?.forEach((childNode, index) => {
      this.renderNode(contentEl, childNode, [...indexPath, index])
    })

    branchEl.appendChild(contentEl)
    container.appendChild(branchEl)
  }

  private renderItem(container: HTMLElement, node: Node, nodeProps: { indexPath: number[]; node: Node }) {
    const itemEl = this.doc.createElement("div")
    this.spreadProps(itemEl, this.api.getItemProps(nodeProps))

    itemEl.appendChild(this.createFileIcon())

    const textNode = this.doc.createTextNode(" " + node.name)
    itemEl.appendChild(textNode)

    container.appendChild(itemEl)
  }

  private syncTree = () => {
    const treeEl = this.rootEl.querySelector<HTMLElement>(".tree-tree")
    if (!treeEl) return

    this.spreadProps(treeEl, this.api.getTreeProps())

    // Save focused element's value before re-render
    const focusedValue = this.doc.activeElement?.getAttribute("data-value")

    // Clear and re-render tree (simpler approach for recursive structure)
    treeEl.innerHTML = ""

    this.collection.rootNode.children?.forEach((node: Node, index: number) => {
      this.renderNode(treeEl, node, [index])
    })

    // Restore focus after re-render
    if (focusedValue) {
      const elementToFocus = treeEl.querySelector<HTMLElement>(`[data-value="${focusedValue}"][tabindex="0"]`)
      elementToFocus?.focus()
    }
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".tree-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    // Collapse all button
    const collapseAllBtn = this.rootEl.querySelector<HTMLElement>(".tree-collapse-all")
    if (collapseAllBtn) {
      collapseAllBtn.onclick = () => this.api.collapse()
    }

    // Expand all button
    const expandAllBtn = this.rootEl.querySelector<HTMLElement>(".tree-expand-all")
    if (expandAllBtn) {
      expandAllBtn.onclick = () => this.api.expand()
    }

    this.syncTree()
  }
}
