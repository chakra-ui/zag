import * as fileUpload from "@zag-js/file-upload"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

export class FileUpload extends Component<fileUpload.Props, fileUpload.Api> {
  initMachine(props: fileUpload.Props) {
    return new VanillaMachine(fileUpload.machine, {
      ...props,
    })
  }

  initApi() {
    return fileUpload.connect(this.machine.service, normalizeProps)
  }

  syncFiles = () => {
    const itemGroup = this.rootEl.querySelector<HTMLElement>(".file-upload-item-group")
    if (!itemGroup) return

    const existingItems = Array.from(itemGroup.querySelectorAll<HTMLElement>(".file-upload-item"))

    // Remove excess items
    while (existingItems.length > this.api.acceptedFiles.length) {
      const item = existingItems.pop()
      if (item) itemGroup.removeChild(item)
    }

    // Update or create items
    this.api.acceptedFiles.forEach((file, index) => {
      let itemEl = existingItems[index]

      if (!itemEl) {
        // Create new item
        itemEl = this.doc.createElement("li")
        itemEl.className = "file-upload-item"

        const nameEl = this.doc.createElement("div")
        nameEl.className = "file-upload-item-name"
        itemEl.appendChild(nameEl)

        const sizeEl = this.doc.createElement("div")
        sizeEl.className = "file-upload-item-size"
        itemEl.appendChild(sizeEl)

        const typeEl = this.doc.createElement("div")
        typeEl.className = "file-upload-item-type"
        itemEl.appendChild(typeEl)

        const deleteBtn = this.doc.createElement("button")
        deleteBtn.className = "file-upload-item-delete"
        deleteBtn.textContent = "×"
        itemEl.appendChild(deleteBtn)

        itemGroup.appendChild(itemEl)
      }

      // Always update props and content for all items (both new and existing)
      spreadProps(itemEl, this.api.getItemProps({ file }))

      const nameEl = itemEl.querySelector<HTMLElement>(".file-upload-item-name")
      if (nameEl) {
        spreadProps(nameEl, this.api.getItemNameProps({ file }))
        nameEl.textContent = file.name
      }

      const sizeEl = itemEl.querySelector<HTMLElement>(".file-upload-item-size")
      if (sizeEl) {
        spreadProps(sizeEl, this.api.getItemSizeTextProps({ file }))
        sizeEl.textContent = this.api.getFileSize(file)
      }

      const typeEl = itemEl.querySelector<HTMLElement>(".file-upload-item-type")
      if (typeEl) typeEl.textContent = file.type

      const deleteBtn = itemEl.querySelector<HTMLElement>(".file-upload-item-delete")
      if (deleteBtn) spreadProps(deleteBtn, this.api.getItemDeleteTriggerProps({ file }))
    })
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const label = this.rootEl.querySelector<HTMLElement>(".file-upload-label")
    if (label) spreadProps(label, this.api.getLabelProps())

    const dropzone = this.rootEl.querySelector<HTMLElement>(".file-upload-dropzone")
    if (dropzone) spreadProps(dropzone, this.api.getDropzoneProps())

    const hiddenInput = this.rootEl.querySelector<HTMLInputElement>(".file-upload-hidden-input")
    if (hiddenInput) spreadProps(hiddenInput, this.api.getHiddenInputProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".file-upload-trigger")
    if (trigger) spreadProps(trigger, this.api.getTriggerProps())

    const itemGroup = this.rootEl.querySelector<HTMLElement>(".file-upload-item-group")
    if (itemGroup) spreadProps(itemGroup, this.api.getItemGroupProps())

    const clearBtn = this.rootEl.querySelector<HTMLElement>(".file-upload-clear")
    if (clearBtn) spreadProps(clearBtn, this.api.getClearTriggerProps())

    // Sync files after all other props are set
    this.syncFiles()
  }
}
