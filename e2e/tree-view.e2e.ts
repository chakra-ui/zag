import { test } from "@playwright/test"
import { TreeViewModel } from "./models/tree-view.model"

let I: TreeViewModel

test.describe("tree view / basic", () => {
  test.beforeEach(async ({ page }) => {
    I = new TreeViewModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("clicking on a node selects it", async () => {
    await I.clickItem("panda.config.ts")
    await I.seeItemIsSelected(["panda.config.ts"])
  })

  test("If no selection, first node should be added to tab sequence", async () => {
    await I.seeBranchIsTabbable("node_modules")
  })

  test("If selection exists, first selected node should be added to tab sequence", async () => {
    await I.clickItem("panda.config.ts")
    await I.seeItemIsTabbable("panda.config.ts")
    await I.clickOutside()
    await I.seeItemIsTabbable("panda.config.ts")
  })

  test("expand/collapse all button", async () => {
    await I.clickButton("Expand all")
    await I.seeBranchIsExpanded(["node_modules", "src", "node_modules/@types"])
  })

  test("select all button", async () => {
    await I.controls.select("selectionMode", "multiple")
    await I.clickButton("Select all")
    await I.seeItemIsSelected(["node_modules", "src", "panda.config.ts", "package.json", "renovate.json", "README.md"])
  })
})

test.describe("tree view / keyboard", () => {
  test.beforeEach(async ({ page }) => {
    I = new TreeViewModel(page)
    await I.goto()
  })

  test("Arrow Down should move focus down", async () => {
    await I.focusFirstNode()

    await I.pressKey("ArrowDown")
    await I.seeBranchIsFocused("src")

    await I.pressKey("ArrowDown")
    await I.seeItemIsFocused("panda.config.ts")
  })

  test("Arrow Up should move focus up", async () => {
    await I.focusItem("README.md")

    await I.pressKey("ArrowUp")
    await I.seeItemIsFocused("renovate.json")

    await I.pressKey("ArrowUp")
    await I.seeItemIsFocused("package.json")
  })

  test("Home: should move focus to first tree item", async () => {
    await I.focusItem("README.md")
    await I.pressKey("Home")
    await I.seeBranchIsFocused("node_modules")
  })

  test("End: should move focus to last tree item", async () => {
    await I.focusFirstNode()
    await I.pressKey("End")
    await I.focusItem("README.md")
  })

  test("Branch: Arrow Right", async () => {
    await I.focusFirstNode()

    await I.pressKey("ArrowRight")
    await I.seeBranchIsExpanded(["node_modules"])

    await I.pressKey("ArrowRight")
    await I.seeItemIsFocused("zag-js")
  })

  test("Branch: Arrow Left", async () => {
    await I.focusFirstNode()

    await I.pressKey("ArrowRight", 2)
    await I.pressKey("ArrowLeft")
    await I.seeBranchIsFocused("node_modules")

    await I.pressKey("ArrowLeft")
    await I.seeBranchIsCollapsed("node_modules")
  })

  // TODO: This works in the browser but not in playwright
  test.skip("typeahead should move focus to matching item", async ({ page }) => {
    await I.focusFirstNode()

    await page.keyboard.down("p")
    await I.seeItemIsFocused("panda.config.ts")

    // should search expanded nodes
    await I.clickBranch("node_modules")
    await page.waitForTimeout(20)
    await page.keyboard.down("z")

    await I.seeItemIsFocused("zag-js")
  })
})

test.describe("tree view / multiple selection", () => {
  test.beforeEach(async ({ page }) => {
    I = new TreeViewModel(page)
    await I.goto()
    await I.controls.select("selectionMode", "multiple")
  })

  test("Ctrl + Click should toggle selection", async () => {
    await I.clickItem("panda.config.ts", { modifiers: ["Meta"] })
    await I.clickItem("package.json", { modifiers: ["Meta"] })
    await I.clickBranch("src", { modifiers: ["Meta"] })
    await I.seeItemIsSelected(["panda.config.ts", "package.json", "src"])
  })

  test("Ctrl + A should select all visible nodes", async ({ page }) => {
    await I.focusFirstNode()
    await page.keyboard.press("Meta+a")

    const nodes = ["node_modules", "src", "panda.config.ts", "package.json", "renovate.json", "README.md"]
    await I.seeItemIsSelected(nodes)

    await I.clickBranch("src")
    await page.keyboard.press("Meta+a")
    await I.seeItemIsSelected([...nodes, "app.tsx", "index.ts"])
  })

  test("Shift + Click should extend selection from anchor node to clicked node", async () => {
    await I.clickBranch("src")
    await I.clickItem("package.json", { modifiers: ["Shift"] })

    await I.seeItemIsSelected(["src", "app.tsx", "index.ts", "panda.config.ts", "package.json"])
  })

  test("Shift + Click should extend selection without anchor node", async () => {
    await I.clickItem("panda.config.ts", { modifiers: ["Shift"] })
    await I.seeItemIsSelected(["node_modules", "src", "panda.config.ts"])
  })

  test("Shift + Arrow Down should extend selection down", async () => {
    await I.focusFirstNode()
    await I.pressKey("Shift+ArrowDown", 2)
    await I.seeItemIsSelected(["src", "panda.config.ts"])
  })

  test("Shift + Arrow Up should extend selection up", async () => {
    await I.focusItem("README.md")
    await I.pressKey("Shift+ArrowUp", 2)
    await I.seeItemIsSelected(["package.json", "renovate.json"])
  })

  test("Shift + Arrow Up + Arrow Down should modify", async () => {
    await I.focusFirstNode()

    await I.pressKey("Shift+ArrowDown", 3)
    await I.seeItemIsSelected(["src", "panda.config.ts", "package.json"])

    await I.pressKey("Shift+ArrowUp", 2)
    await I.seeItemIsSelected(["src"])
  })

  test("Shift + Arrow Up + Arrow Down should modify and preserve anchor", async () => {
    await I.clickItem("panda.config.ts")

    await I.pressKey("Shift+ArrowDown", 2)
    await I.seeItemIsSelected(["panda.config.ts", "package.json", "renovate.json"])

    await I.pressKey("Shift+ArrowUp", 3)
    await I.seeItemIsSelected(["panda.config.ts", "src"])
  })

  test("Asterisk key should select expand siblings", async () => {
    await I.focusItem("panda.config.ts")
    await I.pressKey("*")
    await I.seeBranchIsExpanded(["node_modules", "src"])
  })
})

test.describe("tree view / expand all + collapse all", () => {
  test.beforeEach(async ({ page }) => {
    I = new TreeViewModel(page)
    await I.goto()
  })

  test("expand all button", async () => {
    await I.clickButton("Expand all")
    await I.seeAllBranchesAreExpanded()

    await I.clickButton("Collapse all")
    await I.seeAllBranchesAreCollapsed()
  })
})
