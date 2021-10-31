describe("dropdown menu", () => {
  beforeEach(() => {
    cy.visit("/nested-menu")
    cy.injectAxe()
    cy.findByTestId("trigger").as("rootTrigger").click()
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
