import { test, expect } from "@playwright/test"
import path from "node:path"
import { FileUploadModel } from "./models/file-upload.model"

let I: FileUploadModel

test.describe("file-upload", () => {
  test.beforeEach(async ({ page }) => {
    I = new FileUploadModel(page)
    await I.goto()
  })

  // TBD: fix a11y complaints
  test.skip("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should be focused when page is tabbed", async () => {
    await I.page.click("main")
    await I.pressKey("Tab")
    await I.seeDropzoneIsFocused()
  })

  test("should open file picker on trigger click", async () => {
    const fileChooser = await I.openFilePicker()
    expect(fileChooser).toBeDefined()
  })

  test("should display chosen file", async () => {
    const fileChooser = await I.openFilePicker()
    await fileChooser.setFiles(path.join(__dirname, "fixtures/text.txt"))

    await I.seeItem("text.txt")
    await I.seeDeleteTrigger()
  })

  test("should upload file via trigger click", async () => {
    const filePath = path.join(__dirname, "fixtures/text.txt")
    await I.uploadFile(filePath)

    await I.seeFileDetails("text.txt")
    await I.seeDeleteTrigger()
  })

  test("should upload file via dropzone click", async () => {
    const filePath = path.join(__dirname, "fixtures/text.txt")
    await I.uploadFileViaDropzone(filePath)

    await I.seeFileDetails("text.txt")
    await I.seeDeleteTrigger()
  })

  test("should upload file via drag and drop", async () => {
    const filePath = path.join(__dirname, "fixtures/text.txt")
    await I.uploadFileViaDragAndDrop(filePath)

    await I.seeFileDetails("text.txt")
    await I.seeDeleteTrigger()
  })

  test("should delete uploaded file", async () => {
    const filePath = path.join(__dirname, "fixtures/text.txt")
    await I.uploadFile(filePath)

    await I.seeFileDetails("text.txt")
    await I.deleteFile()
    await I.seeNoFiles()
  })

  test("should have disabled attributes when disabled", async () => {
    await I.controls.bool("disabled")
    await I.seeTriggerIsDisabled()
    await I.seeHiddenInputIsDisabled()
  })

  test("should not reopen file picker after ESC key", async () => {
    await I.page.click("main")
    await I.pressKey("Tab")

    const tracker = I.trackFileChooserEvents()
    const fileChooser = await I.openFilePickerWithKeyboard()
    expect(fileChooser).toBeDefined()
    expect(tracker.count).toBe(1)

    await I.pressKey("Escape")
    await I.waitForNextFrame()

    expect(tracker.count).toBe(1)
  })

  test("should not open file picker twice when clicking trigger inside dropzone", async () => {
    const tracker = I.trackFileChooserEvents()
    const fileChooser = await I.openFilePicker()
    expect(fileChooser).toBeDefined()

    await I.waitForNextFrame()

    expect(tracker.count).toBe(1)
  })
})
