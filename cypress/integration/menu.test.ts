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
  })
})

function pointerOver(id: string) {
  return cy.findByTestId(id).should("be.visible").realHover({ pointer: "mouse", position: "center" })
}
