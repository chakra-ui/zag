import { expect, type Page } from "@playwright/test"
import { clickViz, controls } from "./_utils"

interface ClickOptions {
  modifiers?: Array<"Alt" | "Control" | "Meta" | "Shift">
}

export class TreeViewModel {
  constructor(private readonly page: Page) {}
  goto() {
    return this.page.goto("/tree-view")
  }
  item(name: string) {
    return this.page.getByRole("treeitem", { name })
  }
  branch(name: string) {
    return this.page.locator(`[role=treeitem][data-branch="${name}"]`)
  }
  branchButton(name: string) {
    return this.page.locator(`[role=button][data-branch="${name}"]`)
  }
  get controls() {
    return controls(this.page)
  }
  clickViz() {
    return clickViz(this.page)
  }
  button(name: string) {
    return this.page.getByRole("button", { name }).first()
  }
  clickItem(name: string, options?: ClickOptions) {
    return this.item(name).click(options)
  }
  clickBranch(name: string, options?: ClickOptions) {
    return this.branchButton(name).click(options)
  }
  clickButton(name: string, options?: ClickOptions) {
    return this.button(name).click(options)
  }
  focusItem(name: string) {
    return this.item(name).focus()
  }
  focusButton(name: string) {
    return this.button(name).focus()
  }
  async focusFirstNode() {
    await this.branchButton("node_modules").focus()
  }
  expectToBeSelected(name: string) {
    return expect(this.item(name)).toHaveAttribute("aria-selected", "true")
  }
  expectAllToBeSelected(nodes: string[]) {
    return Promise.all(nodes.map((node) => this.expectToBeSelected(node)))
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
  expectAllToBeExpanded(nodes: string[]) {
    return Promise.all(nodes.map((node) => this.expectToBeExpanded(node)))
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
