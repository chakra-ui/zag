import * as cascadeSelect from "@zag-js/cascade-select"
import { cascadeSelectData } from "@zag-js/shared"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

interface Node {
  label: string
  value: string
  continents?: Node[]
  countries?: Node[]
  code?: string
  states?: Node[]
}

export class CascadeSelect extends Component<cascadeSelect.Props, cascadeSelect.Api> {
  private getCollection() {
    return cascadeSelect.collection<Node>({
      nodeToValue: (node) => node.value,
      nodeToString: (node) => node.label,
      nodeToChildren: (node) => node.continents ?? node.countries ?? node.states,
      rootNode: cascadeSelectData,
    })
  }

  initMachine(props: cascadeSelect.Props) {
    const self = this
    return new VanillaMachine(cascadeSelect.machine, {
      ...props,
      name: "location",
      get collection() {
        return self.getCollection()
      },
    })
  }

  initApi() {
    return cascadeSelect.connect(this.machine.service, normalizeProps)
  }

  private renderTreeNode(container: HTMLElement, node: Node, indexPath: number[] = [], value: string[] = []) {
    const collection = this.getCollection()
    const nodeProps = { indexPath, value, item: node }
    const nodeState = this.api.getItemState(nodeProps)
    const children = collection.getNodeChildren(node)

    // Create or update list
    let listEl = container.querySelector<HTMLElement>(`.cascade-select-list[data-depth="${indexPath.length}"]`)
    if (!listEl) {
      listEl = this.doc.createElement("ul")
      listEl.className = "cascade-select-list"
      container.appendChild(listEl)
    }
    this.spreadProps(listEl, this.api.getListProps(nodeProps))

    // Get existing items
    const existingItems = Array.from(listEl.querySelectorAll<HTMLElement>(".cascade-select-item"))

    // Remove excess items
    while (existingItems.length > children.length) {
      const item = existingItems.pop()
      if (item) listEl.removeChild(item)
    }

    // Update or create items
    children.forEach((item, index) => {
      const itemProps = {
        indexPath: [...indexPath, index],
        value: [...value, collection.getNodeValue(item)],
        item,
      }
      const itemState = this.api.getItemState(itemProps)

      let itemEl = existingItems[index]
      if (!itemEl) {
        itemEl = this.doc.createElement("li")
        itemEl.className = "cascade-select-item"

        const textEl = this.doc.createElement("span")
        textEl.className = "cascade-select-item-text"
        itemEl.appendChild(textEl)

        const indicatorEl = this.doc.createElement("span")
        indicatorEl.className = "cascade-select-item-indicator"
        indicatorEl.textContent = "✓"
        itemEl.appendChild(indicatorEl)

        const branchIndicator = this.doc.createElement("span")
        branchIndicator.className = "cascade-select-branch-indicator"
        branchIndicator.textContent = ">"
        itemEl.appendChild(branchIndicator)

        listEl.appendChild(itemEl)
      }

      this.spreadProps(itemEl, this.api.getItemProps(itemProps))

      const textEl = itemEl.querySelector<HTMLElement>(".cascade-select-item-text")
      if (textEl) {
        this.spreadProps(textEl, this.api.getItemTextProps(itemProps))
        textEl.textContent = item.label
      }

      const indicatorEl = itemEl.querySelector<HTMLElement>(".cascade-select-item-indicator")
      if (indicatorEl) {
        this.spreadProps(indicatorEl, this.api.getItemIndicatorProps(itemProps))
      }

      const branchIndicator = itemEl.querySelector<HTMLElement>(".cascade-select-branch-indicator")
      if (branchIndicator) {
        branchIndicator.style.display = itemState.hasChildren ? "" : "none"
      }
    })

    // Handle highlighted child (recursive rendering)
    const highlightedChild = nodeState.highlightedChild
    const childListSelector = `.cascade-select-list[data-depth="${indexPath.length + 1}"]`
    let childContainer = container.querySelector<HTMLElement>(childListSelector)

    if (highlightedChild && collection.isBranchNode(highlightedChild)) {
      this.renderTreeNode(
        container,
        highlightedChild,
        [...indexPath, nodeState.highlightedIndex],
        [...value, collection.getNodeValue(highlightedChild)],
      )
    } else if (childContainer) {
      // Remove child list if no highlighted child
      childContainer.remove()
    }
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".cascade-select-label")
    if (label) this.spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".cascade-select-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".cascade-select-trigger")
    if (trigger) this.spreadProps(trigger, this.api.getTriggerProps())

    const valueText = this.rootEl.querySelector<HTMLElement>(".cascade-select-value-text")
    if (valueText) {
      this.spreadProps(valueText, this.api.getValueTextProps())
      valueText.textContent = this.api.valueAsString || "Select a location"
    }

    const indicator = this.rootEl.querySelector<HTMLElement>(".cascade-select-indicator")
    if (indicator) this.spreadProps(indicator, this.api.getIndicatorProps())

    const clearBtn = this.rootEl.querySelector<HTMLElement>(".cascade-select-clear")
    if (clearBtn) this.spreadProps(clearBtn, this.api.getClearTriggerProps())

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".cascade-select-hidden-input")
    if (hiddenInput) this.spreadProps(hiddenInput, this.api.getHiddenInputProps())

    const positioner = this.rootEl.querySelector<HTMLElement>(".cascade-select-positioner")
    if (positioner) this.spreadProps(positioner, this.api.getPositionerProps())

    const content = this.rootEl.querySelector<HTMLElement>(".cascade-select-content")
    if (content) {
      this.spreadProps(content, this.api.getContentProps())
      // Render tree starting from root
      this.renderTreeNode(content, this.getCollection().rootNode)
    }
  }
}
