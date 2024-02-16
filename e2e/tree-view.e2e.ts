import { test } from "@playwright/test"
import { a11y, clickOutside } from "./_utils"
import { TreeViewModel } from "./models/tree-view.model"

let tree: TreeViewModel

test.describe("tree view / basic", () => {
  test.beforeEach(async ({ page }) => {
    tree = new TreeViewModel(page)
    await tree.goto()
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("clicking on a node selects it", async () => {
    await tree.clickItem("panda.config.ts")
    await tree.expectToBeSelected("panda.config.ts")
  })

  test("If no selection, first node should be added to tab sequence", async () => {
    await tree.expectBranchToBeTabbable("node_modules")
  })

  test("If selection exists, first selected node should be added to tab sequence", async ({ page }) => {
    await tree.clickItem("panda.config.ts")
    await tree.expectItemToBeTabbable("panda.config.ts")
    await clickOutside(page)
    await tree.expectItemToBeTabbable("panda.config.ts")
  })

  test("Interaction outside should reset focused node", async ({ page }) => {
    await tree.focusItem("panda.config.ts")
    await page.click("text=My Documents")
    await tree.expectBranchToBeTabbable("node_modules")
  })

  test("expand/collapse all button", async () => {
    await tree.clickButton("Expand all")
    await tree.expectAllToBeExpanded(["node_modules", "src", "node_modules/@types"])
  })

  test("select all button", async () => {
    await tree.controls.select("selectionMode", "multiple")
    await tree.clickButton("Select all")
    await tree.expectAllToBeSelected([
      "node_modules",
      "src",
      "panda.config.ts",
      "package.json",
      "renovate.json",
      "README.md",
    ])
  })
})

test.describe("tree view / keyboard", () => {
  test.beforeEach(async ({ page }) => {
    tree = new TreeViewModel(page)
    await tree.goto()
  })

  test("Arrow Down should move focus down", async ({ page }) => {
    await tree.focusFirstNode()

    await page.keyboard.press("ArrowDown")
    await tree.expectBranchToBeFocused("src")

    await page.keyboard.press("ArrowDown")
    await tree.expectItemToBeFocused("panda.config.ts")
  })

  test("Arrow Up should move focus up", async ({ page }) => {
    await tree.focusItem("README.md")

    await page.keyboard.press("ArrowUp")
    await tree.expectItemToBeFocused("renovate.json")

    await page.keyboard.press("ArrowUp")
    await tree.expectItemToBeFocused("package.json")
  })

  test("Home: should move focus to first tree item", async ({ page }) => {
    await tree.focusItem("README.md")
    await page.keyboard.press("Home")
    await tree.expectBranchToBeFocused("node_modules")
  })

  test("End: should move focus to last tree item", async ({ page }) => {
    await tree.focusFirstNode()
    await page.keyboard.press("End")
    await tree.focusItem("README.md")
  })

  test("Branch: Arrow Right", async ({ page }) => {
    await tree.focusFirstNode()

    await page.keyboard.press("ArrowRight")
    await tree.expectToBeExpanded("node_modules")

    await page.keyboard.press("ArrowRight")
    await tree.expectItemToBeFocused("zag-js")
  })

  test("Branch: Arrow Left", async ({ page }) => {
    await tree.focusFirstNode()

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")

    await page.keyboard.press("ArrowLeft")
    await tree.expectBranchToBeFocused("node_modules")

    await page.keyboard.press("ArrowLeft")
    await tree.expectToBeCollapsed("node_modules")
  })

  // TODO: This works in the browser but not in playwright
  test.skip("typeahead should move focus to matching item", async ({ page }) => {
    await tree.focusFirstNode()

    await page.keyboard.down("p")
    await tree.expectItemToBeFocused("panda.config.ts")

    // should search expanded nodes
    await tree.clickBranch("node_modules")
    await page.waitForTimeout(20)
    await page.keyboard.down("z")

    await tree.expectItemToBeFocused("zag-js")
  })
})

test.describe("tree view / multi selection", () => {
  test.beforeEach(async ({ page }) => {
    tree = new TreeViewModel(page)
    await tree.goto()
    await tree.controls.select("selectionMode", "multiple")
  })

  test("Ctrl + Click should toggle selection", async () => {
    await tree.clickItem("panda.config.ts", { modifiers: ["Meta"] })
    await tree.clickItem("package.json", { modifiers: ["Meta"] })
    await tree.clickBranch("src", { modifiers: ["Meta"] })
    await tree.expectAllToBeSelected(["panda.config.ts", "package.json", "src"])
  })

  test("Ctrl + A should select all visible nodes", async ({ page }) => {
    await tree.focusFirstNode()
    await page.keyboard.press("Meta+a")

    const nodes = ["node_modules", "src", "panda.config.ts", "package.json", "renovate.json", "README.md"]
    await tree.expectAllToBeSelected(nodes)

    await tree.clickBranch("src")
    await page.keyboard.press("Meta+a")
    await tree.expectAllToBeSelected([...nodes, "app.tsx", "index.ts"])
  })

  test("Shift + Click should extend selection from anchor node to clicked node", async () => {
    await tree.clickBranch("src")
    await tree.clickItem("package.json", { modifiers: ["Shift"] })

    await tree.expectAllToBeSelected(["src", "app.tsx", "index.ts", "panda.config.ts", "package.json"])
  })

  test("Shift + Click should extend selection without anchor node", async () => {
    await tree.clickItem("panda.config.ts", { modifiers: ["Shift"] })
    await tree.expectAllToBeSelected(["node_modules", "src", "panda.config.ts"])
  })

  test("Shift + Arrow Down should extend selection down", async ({ page }) => {
    await tree.focusFirstNode()
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")
    await tree.expectAllToBeSelected(["src", "panda.config.ts"])
  })

  test("Shift + Arrow Up should extend selection up", async ({ page }) => {
    await tree.focusItem("README.md")
    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")
    await tree.expectAllToBeSelected(["package.json", "renovate.json"])
  })

  test("Shift + Arrow Up + Arrow Down should modify", async ({ page }) => {
    await tree.focusFirstNode()

    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")

    await tree.expectAllToBeSelected(["src", "panda.config.ts", "package.json"])

    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")

    await tree.expectAllToBeSelected(["src"])
  })

  test("Shift + Arrow Up + Arrow Down should modify and preserve anchor", async ({ page }) => {
    await tree.clickItem("panda.config.ts")

    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")
    await tree.expectAllToBeSelected(["panda.config.ts", "package.json", "renovate.json"])

    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")
    await tree.expectAllToBeSelected(["panda.config.ts", "src"])
  })

  test("Asterisk key should select expand siblings", async ({ page }) => {
    await tree.focusItem("panda.config.ts")
    await page.keyboard.press("*")
    await tree.expectAllToBeExpanded(["node_modules", "src"])
  })
})
