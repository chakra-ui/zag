describe("slider", () => {
  beforeEach(() => {
    cy.visit("/slider")
    cy.injectAxe()

    cy.findByTestId("label").as("label")
    cy.findByTestId("output").as("output")
    cy.findByTestId("thumb").as("thumb")
    cy.findByTestId("track").as("track")
  })

  it("should have no accessibility violations", () => {
    cy.findByPart("root").then(cy.checkA11y)
  })

  describe("keyboard interaction", () => {
    it("should work with arrow left/right keys", () => {
      cy.get("@thumb").focus().realType("{rightarrow}")
      cy.get("@output").should("have.text", "1")
      cy.get("@thumb").realType("{rightarrow}")
      cy.get("@output").should("have.text", "2")
    })

    it("should work with home/end keys", () => {
      cy.get("@thumb").focus().realType("{home}")
      cy.get("@output").should("have.text", "0")
      cy.get("@thumb").realType("{end}")
      cy.get("@output").should("have.text", "100")
    })

    it("should work with shift modifier key", () => {
      cy.get("@thumb").focus().realPress(["Shift", "ArrowRight"])
      cy.get("@output").should("have.text", "10")
      cy.get("@thumb").focus().realPress(["Shift", "ArrowLeft"])
      cy.get("@output").should("have.text", "0")
    })

    it("should work with page up/down modifier keys", () => {
      cy.get("@thumb").focus().realType("{pageup}")
      cy.get("@output").should("have.text", "10")
      cy.get("@thumb").focus().realType("{pagedown}")
      cy.get("@output").should("have.text", "0")
    })
  })

  describe("pointer interaction", () => {
    it("should set value on click track", () => {
      cy.get("@track").then((el) => {
        const width = el.width()
        cy.get("@track").click(width * 0.8, 0)
        cy.get("@output").should("have.text", "80")
      })
    })

    it("should set the value on drag", () => {
      cy.get("@track").pan({ x: 0.8, y: 0.5 }, { x: 0.9, y: 0.5 })
    })
  })
})
