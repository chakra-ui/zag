describe("pin input", () => {
  beforeEach(() => {
    cy.visit("/pin-input")
    cy.findByTestId("input-1").as("first")
    cy.findByTestId("input-2").as("second")
    cy.findByTestId("input-3").as("third")
    cy.findByTestId("clear-button").as("clear")
  })

  it("on type: should moves focus to the next input", () => {
    cy.get("@first").focus().realType("1")
    cy.get("@second").should("have.focus").realType("2")
    cy.get("@third").should("have.focus").realType("3")
  })

  it("on backspace: should clear value and move focus to prev input", () => {
    cy.get("@first").focus().realType("1")
    cy.get("@second").should("have.focus").realType("2")
    cy.get("@third").realType("{backspace}")
    cy.get("@second").should("have.focus").and("have.value", "")
  })

  it("on arrow: should change focus between inputs", () => {
    // fill out all fields
    cy.get("@first").focus().realType("1")
    cy.get("@second").should("have.focus").realType("2")
    cy.get("@third").should("have.focus").realType("3")

    // navigate with arrow keys
    cy.get("@third").realType("{leftarrow}")
    cy.get("@second").should("have.focus")
    cy.get("@second").realType("{rightarrow}")
    cy.get("@third").should("have.focus")
  })

  it("on clear: should clear values and focus first", () => {
    // fill out all fields
    cy.get("@first").focus().realType("1")
    cy.get("@second").should("have.focus").realType("2")
    cy.get("@third").should("have.focus").realType("3")

    // click clear
    cy.get("@clear").click()
    cy.get("@first").should("have.focus").and("have.value", "")
    cy.get("@second").should("have.value", "")
    cy.get("@third").should("have.value", "")
  })

  it("on paste: should autofill all fields", () => {
    cy.get("@first").realInput("123")
    cy.get("@first").should("have.value", "1")
    cy.get("@second").should("have.value", "2")
    cy.get("@third").should("have.value", "3").and("have.focus")
  })

  it("on delete: should clear value but keep input focused", () => {
    cy.get("@first").focus().realType("1")
    cy.get("@second").should("have.focus").realType("2")
    cy.get("@third").should("have.focus").realType("3")

    cy.get("@third").realType("{del}")
    cy.get("@third").should("have.value", "")
    cy.get("@third").should("have.focus")
  })

  it("on input: override previous value", () => {
    cy.get("@first").focus().realType("1")
    cy.get("@second").should("have.focus").realType("2")
    cy.get("@third").realType("{leftarrow}")
    cy.get("@second").should("have.focus").realType("5")
    cy.get("@second").should("have.value", "5")
  })

  it("should disallow invalid values", () => {
    // it's currently in numeric mode
    cy.get("@first").focus().realType("f")
    // `f` is not a numeric character
    cy.get("@first").should("have.value", "")
  })
})
