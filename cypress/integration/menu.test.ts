/* eslint-disable jest/expect-expect */

describe("dropdown menu", () => {
  beforeEach(() => {
    cy.visit("/nested-menu")
    cy.injectAxe()
    cy.findByTestId("trigger").as("rootTrigger").click()
  })

  describe("When using keyboard", () => {
    it("should not open submenu when moving focus to trigger", () => {
      cy.findByTestId("menu").type("{downarrow}{downarrow}{downarrow}")
      cy.findByTestId("save-page").should("not.be.visible")
    })

    it("should open submenu and focus first item when pressing right arrow, enter or space key", () => {
      // Space key
      cy.findByTestId("menu").type("{downarrow}{downarrow}{downarrow}").trigger("keydown", { key: " " })
      cy.findByTestId("save-page").should("have.attr", "data-selected")
      cy.findByTestId("more-tools-submenu").should("have.focus").type("{leftarrow}")

      // Enter key to reveal submenu
      cy.findByTestId("menu").type("{enter}")
      cy.findByTestId("more-tools-submenu").should("have.focus").type("{leftarrow}")

      // Right arrow key to reveal submenu
      cy.findByTestId("menu").type("{rightarrow}")
      cy.clickOutside()
    })

    it("should close only the focused submenu when pressing left arrow key", () => {
      cy.findByTestId("menu").type("{downarrow}{downarrow}{downarrow}{enter}")
      cy.findByTestId("more-tools-submenu").type("{downarrow}{downarrow}{downarrow}{enter}")
      cy.findByTestId("open-nested-submenu").type("{leftarrow}")
      cy.findByTestId("welcome").should("not.be.visible")
      cy.findByTestId("more-tools-submenu").type("{leftarrow}")
      cy.findByTestId("save-page").should("not.be.visible")
      cy.clickOutside()
    })

    it("should scope typeahead behaviour to the active menu", () => {
      // root menu typeahead
      cy.findByTestId("menu").type("n")
      cy.findByTestId("new-tab").should("have.attr", "data-selected")
      cy.findByTestId("menu").type("n")
      cy.findByTestId("new-win").should("have.attr", "data-selected")

      // open submenu and typeahead
      cy.findByTestId("menu").type("{downarrow}{rightarrow}")
      cy.findByTestId("more-tools-submenu").should("be.visible").type("n")
      cy.findByTestId("name-win").should("have.attr", "data-selected")
      cy.findByTestId("more-tools-submenu").type("n")
      cy.findByTestId("new-term").should("have.attr", "data-selected")
    })
  })

  describe("selecting nested menu item should close all menus", () => {
    it("with keyboard", () => {
      cy.findByTestId("menu").type("{downarrow}{downarrow}{downarrow}{enter}")
      cy.findByTestId("more-tools-submenu").type("{downarrow}{downarrow}{downarrow}{enter}")
      cy.findByTestId("open-nested-submenu").type("{enter}")
      cy.findByTestId("open-nested-submenu").should("not.be.visible")
      cy.findByTestId("more-tools-submenu").should("not.be.visible")
      cy.findByTestId("menu").should("not.be.visible")
    })

    it("with pointer", () => {
      pointerOver("more-tools")
      pointerOver("open-nested")
      pointerOver("playground").click()
      cy.findByTestId("open-nested-submenu").should("not.be.visible")
      cy.findByTestId("more-tools-submenu").should("not.be.visible")
      cy.findByTestId("menu").should("not.be.visible")
    })
  })

  describe("when using pointer", () => {
    it("should open submenu and not focus first item when moving pointer over trigger", () => {
      pointerOver("more-tools")
      cy.findByTestId("more-tools-submenu").should("be.visible")
      cy.findByTestId("more-tools-submenu").should("have.focus")
    })

    it("should not close when moving pointer to submenu and back to parent trigger", () => {
      pointerOver("more-tools")
      pointerOver("save-page")
      pointerOver("more-tools")
      cy.findByTestId("more-tools-submenu").should("be.visible")
    })

    it("should close submenu when moving pointer away but remain open when moving towards", () => {
      pointerOver("more-tools")
      cy.findByTestId("save-page").should("be.visible")
      pointerExitRightToLeft("more-tools")
      cy.findByTestId("save-page").should("not.be.visible")
    })

    it("should close open submenu when moving pointer to any item in parent menu", () => {
      pointerOver("more-tools")
      pointerOver("save-page")
      pointerOver("new-tab")
      cy.findByTestId("more-tools-submenu").should("not.be.visible")
    })

    it("should close all menus when clicking item in any menu, or clicking outside", () => {
      // Root menu
      cy.findByTestId("new-tab").click()
      cy.findByTestId("new-tab").should("not.be.visible")

      // Submenu
      cy.get("@rootTrigger").click()
      pointerOver("more-tools")
      cy.findByTestId("save-page").click()
      cy.findByTestId("save-page").should("not.be.visible")
      cy.findByTestId("more-tools").should("not.be.visible")

      // Click outside
      cy.get("@rootTrigger").click()
      cy.clickOutside()
      cy.findByTestId("new-tab").should("not.be.visible")
    })
  })
})

function pointerOver(id: string) {
  return cy.findByTestId(id).should("be.visible").realHover({ pointer: "mouse", position: "center" })
}

function pointerExitRightToLeft(id: string) {
  return cy
    .findByTestId(id)
    .should("be.visible")
    .realHover({ position: "right" })
    .realHover({ position: "bottomLeft" })
    .trigger("pointerout", "bottomLeft", { pointerType: "mouse" })
}

// function pointerExitLeftToRight(id: string) {
//   return cy
//     .findByTestId(id)
//     .should("be.visible")
//     .realHover({ position: "left" })
//     .realHover({ position: "bottomRight" })
//     .trigger("pointerout", "bottomRight", { pointerType: "mouse" })
// }
