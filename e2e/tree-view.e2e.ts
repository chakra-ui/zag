import { test } from "@playwright/test"
import { a11y, clickOutside } from "./_utils"
import { TreeViewModel } from "./tree-view.model"

let screen: TreeViewModel

test.describe("tree view / basic", () => {
  test.beforeEach(async ({ page }) => {
    screen = new TreeViewModel(page)
    await screen.goto()
  })

  test("should have no accessibility violation", async ({ page }) => {
    await a11y(page)
  })

  test("clicking on a node selects it", async () => {
    await screen.clickItem("panda.config.ts")
    await screen.expectToBeSelected("panda.config.ts")
  })

  test("If no selection, first node should be added to tab sequence", async () => {
    await screen.expectBranchToBeTabbable("node_modules")
  })

  test("If selection exists, first selected node should be added to tab sequence", async ({ page }) => {
    await screen.clickItem("panda.config.ts")
    await screen.expectItemToBeTabbable("panda.config.ts")
    await clickOutside(page)
    await screen.expectItemToBeTabbable("panda.config.ts")
  })

  test("Interaction outside should reset focused node", async ({ page }) => {
    await screen.focusItem("panda.config.ts")
    await page.click("text=My Documents")
    await screen.expectBranchToBeTabbable("node_modules")
  })

  test("expand/collapse all button", async () => {
    await screen.clickButton("Expand all")
    await screen.expectAllToBeExpanded(["node_modules", "src", "node_modules/@types"])
  })

  test("select all button", async () => {
    await screen.controls.select("selectionMode", "multiple")
    await screen.clickButton("Select all")
    await screen.expectAllToBeSelected([
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
    screen = new TreeViewModel(page)
    await screen.goto()
  })

  test("Arrow Down should move focus down", async ({ page }) => {
    await screen.focusFirstNode()

    await page.keyboard.press("ArrowDown")
    await screen.expectBranchToBeFocused("src")

    await page.keyboard.press("ArrowDown")
    await screen.expectItemToBeFocused("panda.config.ts")
  })

  test("Arrow Up should move focus up", async ({ page }) => {
    await screen.focusItem("README.md")

    await page.keyboard.press("ArrowUp")
    await screen.expectItemToBeFocused("renovate.json")

    await page.keyboard.press("ArrowUp")
    await screen.expectItemToBeFocused("package.json")
  })

  test("Home: should move focus to first tree item", async ({ page }) => {
    await screen.focusItem("README.md")
    await page.keyboard.press("Home")
    await screen.expectBranchToBeFocused("node_modules")
  })

  test("End: should move focus to last tree item", async ({ page }) => {
    await screen.focusFirstNode()
    await page.keyboard.press("End")
    await screen.focusItem("README.md")
  })

  test("Branch: Arrow Right", async ({ page }) => {
    await screen.focusFirstNode()

    await page.keyboard.press("ArrowRight")
    await screen.expectToBeExpanded("node_modules")

    await page.keyboard.press("ArrowRight")
    await screen.expectItemToBeFocused("zag-js")
  })

  test("Branch: Arrow Left", async ({ page }) => {
    await screen.focusFirstNode()

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")

    await page.keyboard.press("ArrowLeft")
    await screen.expectBranchToBeFocused("node_modules")

    await page.keyboard.press("ArrowLeft")
    await screen.expectToBeCollapsed("node_modules")
  })

  // TODO: This works in the browser but not in playwright
  test.skip("typeahead should move focus to matching item", async ({ page }) => {
    await screen.focusFirstNode()

    await page.keyboard.down("p")
    await screen.expectItemToBeFocused("panda.config.ts")

    // should search expanded nodes
    await screen.clickBranch("node_modules")
    await page.waitForTimeout(20)
    await page.keyboard.down("z")

    await screen.expectItemToBeFocused("zag-js")
  })
})

test.describe("tree view / multi selection", () => {
  test.beforeEach(async ({ page }) => {
    screen = new TreeViewModel(page)
    await screen.goto()
    await screen.controls.select("selectionMode", "multiple")
  })

  test("Ctrl + Click should toggle selection", async () => {
    await screen.clickItem("panda.config.ts", { modifiers: ["Meta"] })
    await screen.clickItem("package.json", { modifiers: ["Meta"] })
    await screen.clickBranch("src", { modifiers: ["Meta"] })
    await screen.expectAllToBeSelected(["panda.config.ts", "package.json", "src"])
  })

  test("Ctrl + A should select all visible nodes", async ({ page }) => {
    await screen.focusFirstNode()
    await page.keyboard.press("Meta+a")

    const nodes = ["node_modules", "src", "panda.config.ts", "package.json", "renovate.json", "README.md"]
    await screen.expectAllToBeSelected(nodes)

    await screen.clickBranch("src")
    await page.keyboard.press("Meta+a")
    await screen.expectAllToBeSelected([...nodes, "app.tsx", "index.ts"])
  })

  test("Shift + Click should extend selection from anchor node to clicked node", async () => {
    await screen.clickBranch("src")
    await screen.clickItem("package.json", { modifiers: ["Shift"] })

    await screen.expectAllToBeSelected(["src", "app.tsx", "index.ts", "panda.config.ts", "package.json"])
  })

  test("Shift + Click should extend selection without anchor node", async () => {
    await screen.clickItem("panda.config.ts", { modifiers: ["Shift"] })
    await screen.expectAllToBeSelected(["node_modules", "src", "panda.config.ts"])
  })

  test("Shift + Arrow Down should extend selection down", async ({ page }) => {
    await screen.focusFirstNode()
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")
    await screen.expectAllToBeSelected(["src", "panda.config.ts"])
  })

  test("Shift + Arrow Up should extend selection up", async ({ page }) => {
    await screen.focusItem("README.md")
    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")
    await screen.expectAllToBeSelected(["package.json", "renovate.json"])
  })

  test("Shift + Arrow Up + Arrow Down should modify", async ({ page }) => {
    await screen.focusFirstNode()

    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")

    await screen.expectAllToBeSelected(["src", "panda.config.ts", "package.json"])

    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")

    await screen.expectAllToBeSelected(["src"])
  })

  test("Shift + Arrow Up + Arrow Down should modify and preserve anchor", async ({ page }) => {
    await screen.clickItem("panda.config.ts")

    await page.keyboard.press("Shift+ArrowDown")
    await page.keyboard.press("Shift+ArrowDown")
    await screen.expectAllToBeSelected(["panda.config.ts", "package.json", "renovate.json"])

    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")
    await page.keyboard.press("Shift+ArrowUp")
    await screen.expectAllToBeSelected(["panda.config.ts", "src"])
  })

  test("Asterisk key should select expand siblings", async ({ page }) => {
    await screen.focusItem("panda.config.ts")
    await page.keyboard.press("*")
    await screen.expectAllToBeExpanded(["node_modules", "src"])
  })
})
