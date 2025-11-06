import * as tagsInput from "@zag-js/tags-input"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

export class TagsInput extends Component<tagsInput.Props, tagsInput.Api> {
  initMachine(props: tagsInput.Props) {
    return new VanillaMachine(tagsInput.machine, {
      ...props,
    })
  }

  initApi() {
    return tagsInput.connect(this.machine.service, normalizeProps)
  }

  syncItems = () => {
    const control = this.rootEl.querySelector<HTMLElement>(".tags-input-control")
    if (!control) return

    // Get existing items (excluding the input)
    const existingItems = Array.from(control.querySelectorAll<HTMLElement>(".tags-input-item"))

    // Remove excess items
    while (existingItems.length > this.api.value.length) {
      const item = existingItems.pop()
      if (item) control.removeChild(item)
    }

    // Update or create items
    this.api.value.forEach((value, index) => {
      const itemProps = { value, index }
      let itemEl = existingItems[index]

      if (!itemEl) {
        // Create new item
        itemEl = this.doc.createElement("span")
        itemEl.className = "tags-input-item"

        // Create preview container
        const itemPreview = this.doc.createElement("div")
        itemPreview.className = "tags-input-item-preview"

        const itemText = this.doc.createElement("span")
        itemText.className = "tags-input-item-text"
        itemText.textContent = value
        itemPreview.appendChild(itemText)

        const itemDeleteBtn = this.doc.createElement("button")
        itemDeleteBtn.className = "tags-input-item-delete"
        itemDeleteBtn.textContent = "×"
        itemPreview.appendChild(itemDeleteBtn)

        itemEl.appendChild(itemPreview)

        const itemInput = this.doc.createElement("input")
        itemInput.className = "tags-input-item-input"
        itemEl.appendChild(itemInput)

        // Insert before the input field
        const input = control.querySelector(".tags-input-input")
        if (input) {
          control.insertBefore(itemEl, input)
        } else {
          control.appendChild(itemEl)
        }
      }

      // Always update props for item and its children (both new and existing)
      spreadProps(itemEl, this.api.getItemProps(itemProps))

      const itemPreview = itemEl.querySelector<HTMLElement>(".tags-input-item-preview")
      if (itemPreview) spreadProps(itemPreview, this.api.getItemPreviewProps(itemProps))

      const itemText = itemEl.querySelector<HTMLElement>(".tags-input-item-text")
      if (itemText) {
        spreadProps(itemText, this.api.getItemTextProps(itemProps))
        itemText.textContent = value
      }

      const itemInput = itemEl.querySelector<HTMLInputElement>(".tags-input-item-input")
      if (itemInput) spreadProps(itemInput, this.api.getItemInputProps(itemProps))

      const itemDeleteBtn = itemEl.querySelector<HTMLElement>(".tags-input-item-delete")
      if (itemDeleteBtn) spreadProps(itemDeleteBtn, this.api.getItemDeleteTriggerProps(itemProps))
    })
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".tags-input-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const control = this.rootEl.querySelector<HTMLElement>(".tags-input-control")
    if (control) {
      spreadProps(control, this.api.getControlProps())

      // Ensure input exists first (tags will be inserted before it)
      let input = control.querySelector<HTMLInputElement>(".tags-input-input")
      const clearBtn = control.querySelector<HTMLElement>(".tags-input-clear")

      if (!input) {
        input = this.doc.createElement("input")
        input.className = "tags-input-input"
        // Insert before clear button if it exists
        if (clearBtn) {
          control.insertBefore(input, clearBtn)
        } else {
          control.appendChild(input)
        }
      }

      // Now sync items (they will be inserted before the input)
      this.syncItems()

      // Update input props after items are synced
      spreadProps(input, this.api.getInputProps())

      // Update clear button props
      if (clearBtn) spreadProps(clearBtn, this.api.getClearTriggerProps())
    }

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".tags-input-hidden")
    if (hiddenInput) spreadProps(hiddenInput, this.api.getHiddenInputProps())
  }
}
