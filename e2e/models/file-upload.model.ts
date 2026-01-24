import { expect, type Page } from "@playwright/test"
import { part, testid } from "../_utils"
import { Model } from "./model"

const DROPZONE_SELECTOR = part("dropzone")

export class FileUploadModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/file-upload")
  }

  getDropzone() {
    return this.page.locator(part("dropzone"))
  }

  getTrigger() {
    return this.page.locator(part("trigger"))
  }

  getHiddenInput() {
    return this.page.locator(testid("input"))
  }

  getItem() {
    return this.page.locator(part("item")).first()
  }

  getDeleteTrigger() {
    return this.page.locator(part("item-delete-trigger")).first()
  }

  async focusDropzone() {
    await this.getDropzone().focus()
  }

  async focusTrigger() {
    await this.getTrigger().focus()
  }

  async clickTrigger() {
    await this.getTrigger().click()
  }

  async seeDropzoneIsFocused() {
    await expect(this.getDropzone()).toBeFocused()
  }

  async seeItem(fileName: string) {
    const item = this.getItem()
    await expect(item).toBeVisible()
    await expect(item).toContainText(fileName)
  }

  async seeDeleteTrigger() {
    await expect(this.getDeleteTrigger()).toBeVisible()
  }

  async seeTriggerIsDisabled() {
    await expect(this.getTrigger()).toBeDisabled()
  }

  async seeHiddenInputIsDisabled() {
    await expect(this.getHiddenInput()).toBeDisabled()
  }

  async openFilePicker() {
    const fileChooserPromise = this.page.waitForEvent("filechooser")
    await this.clickTrigger()
    return await fileChooserPromise
  }

  async openFilePickerWithKeyboard() {
    const fileChooserPromise = this.page.waitForEvent("filechooser")
    await this.focusTrigger()
    await this.pressKey("Enter")
    return await fileChooserPromise
  }

  async waitForNextFrame() {
    await this.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)))
  }

  trackFileChooserEvents() {
    let count = 0
    this.page.on("filechooser", () => count++)
    return {
      get count() {
        return count
      },
    }
  }

  async uploadFile(filePath: string) {
    const fileChooser = await this.openFilePicker()
    await fileChooser.setFiles(filePath)
  }

  async uploadFileViaDropzone(filePath: string) {
    const fileChooserPromise = this.page.waitForEvent("filechooser")
    await this.getDropzone().click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(filePath)
  }

  async uploadFileViaDragAndDrop(filePath: string) {
    // Use Playwright's setInputFiles to set files on the hidden input
    // Then simulate drag and drop events
    await this.getHiddenInput().setInputFiles(filePath)

    // Now simulate drag and drop by creating a DataTransfer from the input's files
    await this.page.evaluate(
      async ({ dropzoneSelector, inputSelector }) => {
        const dropzone = document.querySelector(dropzoneSelector)
        const input = document.querySelector(inputSelector) as HTMLInputElement
        if (!dropzone || !input || !input.files || input.files.length === 0) {
          throw new Error("Dropzone or input not found, or no files")
        }

        // Create DataTransfer from the input's files
        const dataTransfer = new DataTransfer()
        for (let i = 0; i < input.files.length; i++) {
          dataTransfer.items.add(input.files[i])
        }

        // Dispatch dragover event
        const dragOverEvent = new DragEvent("dragover", {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        })
        dropzone.dispatchEvent(dragOverEvent)

        // Dispatch drop event - this triggers async file processing
        const dropEvent = new DragEvent("drop", {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        })
        dropzone.dispatchEvent(dropEvent)
      },
      {
        dropzoneSelector: DROPZONE_SELECTOR,
        inputSelector: testid("input"),
      },
    )

    // Wait for file item to appear (no timeout needed, waitFor has its own timeout)
    await this.getItem().waitFor({ state: "visible" })
  }

  async seeFileDetails(fileName: string, fileSize?: string) {
    const item = this.getItem()
    await expect(item).toBeVisible()
    await expect(item).toContainText(fileName)
    if (fileSize) {
      await expect(item).toContainText(fileSize)
    }
  }

  async deleteFile() {
    await this.getDeleteTrigger().click()
  }

  async seeNoFiles() {
    await expect(this.getItem()).not.toBeVisible()
  }
}
