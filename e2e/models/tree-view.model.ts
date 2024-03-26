import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

interface ClickOptions {
  modifiers?: Array<"Alt" | "Control" | "Meta" | "Shift">
}

export class TreeViewModel extends Model {
  constructor(page: Page) {
    super(page)
  }

  goto() {
    return this.page.goto("/tree-view")
  }

  private item(name: string) {
    return this.page.getByRole("treeitem", { name })
  }

  private branch(name: string) {
    return this.page.locator(`[role=treeitem][data-branch="${name}"]`)
  }

  private branchTrigger(name: string) {
    return this.page.locator(`[role=button][data-branch="${name}"]`)
  }

  private button(name: string) {
    return this.page.getByRole("button", { name }).first()
  }

  clickItem(name: string, options?: ClickOptions) {
    return this.item(name).click(options)
  }

  clickBranch(name: string, options?: ClickOptions) {
    return this.branchTrigger(name).click(options)
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
    await this.branchTrigger("node_modules").focus()
  }

  private _seeItemIsSelected(name: string) {
    return expect(this.item(name)).toHaveAttribute("aria-selected", "true")
  }

  seeItemIsSelected(nodes: string[]) {
    return Promise.all(nodes.map((node) => this._seeItemIsSelected(node)))
  }

  seeItemIsFocused(name: string) {
    return expect(this.item(name)).toBeFocused()
  }

  seeBranchIsFocused(name: string) {
    return expect(this.branchTrigger(name)).toBeFocused()
  }

  private _expectToBeExpanded(name: string) {
    return expect(this.branch(name)).toHaveAttribute("aria-expanded", "true")
  }

  seeBranchIsExpanded(nodes: string[]) {
    return Promise.all(nodes.map((node) => this._expectToBeExpanded(node)))
  }

  seeBranchIsCollapsed(name: string) {
    return expect(this.branch(name)).toHaveAttribute("aria-expanded", "false")
  }

  seeBranchIsTabbable(name: string) {
    return expect(this.branchTrigger(name)).toHaveAttribute("tabindex", "0")
  }

  seeItemIsTabbable(name: string) {
    return expect(this.item(name)).toHaveAttribute("tabindex", "0")
  }
}
