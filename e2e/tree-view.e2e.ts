import { expect, test, type Page } from "@playwright/test"
import { a11y, clickOutside } from "./_utils"

// https://sourcegraph.com/github.com/winglang/wing@7624e16278478db4499e3b439e0c70e4ba98a1b0/-/blob/apps/wing-console/console/design-system/src/headless/tree-view.test.tsx
// https://sourcegraph.com/github.com/microsoft/fluentui@7ee75ce7557b69f3bab5e739bbf242843b756a62/-/blob/packages/react-components/react-tree/src/components/Tree/Tree.cy.tsx
// https://sourcegraph.com/github.com/dgreene1/react-accessible-treeview@4e82bb37f0d6a5b824ccdb285aebbcbcf29ed38b/-/blob/src/__tests__/ClickActionFocus.test.tsx

class PageModel {
  constructor(private readonly page: Page) {}
  item(name: string) {
    return this.page.getByRole("treeitem", { name })
  }
  branch(name: string) {
    return this.page.locator(`[role=treeitem][data-branch="${name}"]`)
  }
  private branchButton(name: string) {
    return this.page.locator(`[role=button][data-branch="${name}"]`)
  }
  button(name: string) {
    return this.page.getByRole("button", { name })
  }
  clickItem(name: string) {
    return this.item(name).click()
  }
  clickBranch(name: string) {
    return this.branchButton(name).click()
  }
  clickButton(name: string) {
    return this.button(name).click()
  }
  focusItem(name: string) {
    return this.item(name).focus()
  }
  focusButton(name: string) {
    return this.button(name).focus()
  }
  async focusTree() {
    await this.focusButton("Select All")
    await this.page.keyboard.press("Tab")
  }
  expectToBeSelected(name: string) {
    return expect(this.item(name)).toHaveAttribute("aria-selected", "true")
  }
  expectItemToBeFocused(name: string) {
    return expect(this.item(name)).toBeFocused()
  }
  expectBranchToBeFocused(name: string) {
    return expect(this.branchButton(name)).toBeFocused()
  }
  expectToBeExpanded(name: string) {
    return expect(this.branch(name)).toHaveAttribute("aria-expanded", "true")
  }
  expectToBeCollapsed(name: string) {
    return expect(this.branch(name)).toHaveAttribute("aria-expanded", "false")
  }
  expectBranchToBeTabbable(name: string) {
    return expect(this.branchButton(name)).toHaveAttribute("tabindex", "0")
  }
  expectItemToBeTabbable(name: string) {
    return expect(this.item(name)).toHaveAttribute("tabindex", "0")
  }
}

let screen: PageModel

test.describe("tree view / basic", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tree-view")
    screen = new PageModel(page)
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
    await screen.expectToBeExpanded("node_modules")
    await screen.expectToBeExpanded("src")
    await screen.expectToBeExpanded("node_modules/@types")
  })

  test("select all button", async () => {
    await screen.clickButton("Select all")
    await screen.expectToBeSelected("node_modules")
    await screen.expectToBeSelected("src")
    await screen.expectToBeSelected("panda.config.ts")
    await screen.expectToBeSelected("package.json")
    await screen.expectToBeSelected("renovate.json")
    await screen.expectToBeSelected("README.md")
  })
})

test.describe("tree view / keyboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tree-view")
    screen = new PageModel(page)
  })

  test("Arrow Down should move focus down", async ({ page }) => {
    await screen.focusTree()

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
    await screen.focusTree()
    await page.keyboard.press("End")
    await screen.focusItem("README.md")
  })

  test("Branch: Arrow Right", async ({ page }) => {
    await screen.focusTree()

    await page.keyboard.press("ArrowRight")
    await screen.expectToBeExpanded("node_modules")

    await page.keyboard.press("ArrowRight")
    await screen.expectItemToBeFocused("zag-js")
  })

  test("Branch: Arrow Left", async ({ page }) => {
    await screen.focusTree()

    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")

    await page.keyboard.press("ArrowLeft")
    await screen.expectBranchToBeFocused("node_modules")

    await page.keyboard.press("ArrowLeft")
    await screen.expectToBeCollapsed("node_modules")
  })

  test.skip("typeahead should move focus to matching item", async ({ page }) => {
    await screen.focusTree()

    await page.keyboard.press("p")
    await screen.expectItemToBeFocused("panda.config.ts")

    // should search expanded nodes
    await screen.clickBranch("node_modules")
    await page.keyboard.press("z")

    await screen.expectItemToBeFocused("zag-js")
  })
})

test.describe("tree view / single selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tree-view")
    screen = new PageModel(page)
  })
})

test.describe("tree view / multi selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tree-view")
    screen = new PageModel(page)
  })

  test("Ctrl + Click should toggle selection", async () => {})

  test("Ctrl + A should select all visible nodes", async () => {})

  test("Shift + Click should extend selection from anchor node to clicked node", async () => {})

  test("Shift + Click should extend selection without anchor node", async () => {})

  test("Shift + Arrow Down should extend selection down", async () => {})

  test("Shift + Arrow Up should extend selection up", async () => {})

  test("Shift + Arrow Up + Arrow Down should modify and preserve anchor", async () => {})

  test("Asterisk key should select expand siblings", async () => {})
})
