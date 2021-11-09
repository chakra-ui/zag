describe("dropdown menu", () => {
  beforeEach(() => {
    cy.visit("/number-input")
    cy.injectAxe()

    cy.findByTestId("input").as("input")

    cy.findByTestId("inc-button").as("inc")
    cy.findByTestId("dec-button").as("dec")

    cy.findByTestId("scrubber").as("scrubber")
  })

  it("should have not accessibility voilations", () => {
    cy.checkA11y(".root")
  })

  describe("when typing into the input", () => {
    it("should allow empty string value", () => {
      cy.get("@input").type("12{backspace}{backspace}").should("be.empty")
    })

    it("should clamp value when blurred", () => {
      cy.get("@input").type("200")
      cy.get("@input").should("have.attr", "aria-invalid", "true")
      cy.get("@input").blur().should("have.value", "100")
    })
  })

  describe("when using keyboard arrow in the input", () => {
    it("should increment the value", () => {
      cy.get("@input").type("5{uparrow}")
      cy.get("@input").should("have.value", "6")
    })

    it("should decrement the value", () => {
      cy.get("@input").type("5{downarrow}{downarrow}")
      cy.get("@input").should("have.value", "3")
    })

    it("should for home/end keys", () => {
      cy.get("@input").type("5{home}").should("have.value", "0")
      cy.get("@input").type("5{end}").should("have.value", "100")
    })

    it("should change 10 steps on shift arrow", () => {
      cy.get("@input").type("0{uparrow}").should("have.value", "1")
      cy.get("@input").type("{shift}{uparrow}").should("have.value", "11")
      cy.get("@input").type("{shift}{downarrow}").should("have.value", "1")
      cy.get("@input").type("{downarrow}").should("have.value", "0")
    })

    it("should change for 0.1 steps", () => {
      cy.findByTestId("step").clear().type("0.1{enter}")
      cy.findByTestId("precision").clear().type("2{enter}")

      cy.get("@input").type("{uparrow}").should("have.value", "0.10")
      cy.get("@input").type("{ctrl}{uparrow}").should("have.value", "0.11")
      cy.get("@input").type("{ctrl}{downarrow}").should("have.value", "0.10")
      cy.get("@input").type("{downarrow}").should("have.value", "0.00")
    })

    it("should clear input if invalid `e` is typed", () => {
      cy.get("@input").type("e").blur().should("have.value", "")
      cy.get("@input").type("1e20").blur().should("have.value", "100")
    })
  })

  const clock = {
    interval: 50,
    change: 300,
    tick(n: number) {
      cy.tick(clock.interval * n + clock.change)
    },
  }

  describe("when using the spinner", () => {
    beforeEach(() => {
      cy.clock()
    })

    it("should spin value on increment long press", () => {
      cy.get("@inc").trigger("pointerdown")
      cy.get("@input").should("have.value", "1")
      clock.tick(10)
      cy.get("@inc").trigger("pointerup")
      cy.get("@input").should("have.value", "11").and("have.focus")
    })

    it("should spin value on decrement long press", () => {
      cy.get("@input").type("20")
      cy.get("@dec").trigger("pointerdown")
      cy.get("@input").should("have.value", "19")
      clock.tick(10)
      cy.get("@inc").trigger("pointerup")
      cy.get("@input").should("have.value", "9").and("have.focus")
    })
  })

  describe("when using scrubber", () => {
    beforeEach(() => {
      cy.get("@scrubber").realMouseDown({ pointer: "mouse", position: "center" })
    })
    it("should increment on left mouse movement", () => {
      for (let i = 0; i <= 10; i++) {
        cy.document().trigger("mousemove", { movementX: i * 2, movementY: 0 })
      }
      cy.get("@input").should("have.value", "10")
      cy.document().trigger("mouseup")
    })
  })
})
