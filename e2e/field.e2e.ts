import { expect, test } from "./_test"
import { FieldModel } from "./models/field.model"

let I: FieldModel

test.describe("field", () => {
  test.beforeEach(async ({ page }) => {
    I = new FieldModel(page)
  })

  test.describe("basic", () => {
    test.beforeEach(async () => {
      await I.goto("basic")
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("label points to the control", async () => {
      await I.seeLabelPointsToControl()
    })

    test("starts pristine: no interaction or validity attributes", async () => {
      await I.seePristine()
      await I.dontSeeAriaInvalid()
    })

    test("data-attribute lifecycle: pristine → focused → dirty/filled → touched", async () => {
      await I.focusControl()
      await I.seeControlAttr("data-focus")

      await I.fillControl("sage")
      await I.seeControlAttr("data-dirty")
      await I.seeControlAttr("data-filled")

      await I.blurControl()
      await I.seeControlAttr("data-touched")
      await I.dontSeeControlAttr("data-focus")
    })

    test("required empty field errors at submit, not before", async () => {
      await I.focusControl()
      await I.blurControl()
      // pristine + empty: valueMissing is suppressed until submit forces it
      await I.dontSeeError()

      await I.submit()
      await I.seeError("Please fill out this field.")
      await I.seeAriaInvalid()
      await I.seeControlAttr("data-invalid")
      await I.seeErrorDescribed(true)
    })

    test("typing after a submit attempt revalidates live", async () => {
      await I.submit()
      await I.seeError()

      await I.fillControl("sage")
      await I.dontSeeError()
      await I.seeControlAttr("data-valid")
      await I.seeErrorDescribed(false)
    })

    test("form reset restores the pristine state", async () => {
      await I.fillControl("sage")
      await I.blurControl()
      await I.submit()
      await I.reset()
      await I.seePristine()
    })

    test("controlled invalid prop marks the field invalid without errors", async () => {
      await I.toggleOption("Invalid")
      await I.seeAriaInvalid()
      await I.seeControlAttr("data-invalid")
      await I.seeError("Field is invalid")
    })

    test("disabled field hides the error and drops validity", async () => {
      await I.submit()
      await I.seeError()

      await I.toggleOption("Disabled")
      await I.dontSeeError()
      await I.dontSeeAriaInvalid()
      await I.seeControlAttr("data-disabled")
    })
  })

  test.describe("controlled dirty / touched", () => {
    test.beforeEach(async () => {
      await I.goto("controlled")
    })

    test("controlled props set dirty and touched without interacting", async () => {
      await I.toggleOption("Dirty")
      await I.seeControlAttr("data-dirty")

      await I.toggleOption("Touched")
      await I.seeControlAttr("data-touched")
    })

    test("controlled props do not update from user input", async () => {
      await I.fillControl("sage")
      await I.blurControl()
      await I.dontSeeControlAttr("data-dirty")
      await I.dontSeeControlAttr("data-touched")
    })
  })

  test.describe("validation modes", () => {
    test.beforeEach(async () => {
      await I.goto("validation")
    })

    test("onSubmit: custom error stays hidden while typing, blocks submit, surfaces on submit", async () => {
      await I.fillControl("taken@example.com")
      await I.dontSeeError()

      await I.submit()
      await I.dontSeeSubmitted()
      await I.seeError("This email is already taken")

      await I.fillControl("free@example.com")
      await I.dontSeeError()

      await I.submit()
      await I.seeSubmitted()
    })

    test("onBlur: error commits when the control loses focus", async () => {
      await I.setMode("onBlur")
      await I.fillControl("taken@example.com")
      await I.dontSeeError()

      await I.blurControl()
      await I.seeError("This email is already taken")
    })

    test("onBlur: pristine empty required field is not flagged, dirtied one is", async () => {
      await I.setMode("onBlur")
      await I.focusControl()
      await I.blurControl()
      await I.dontSeeError()

      await I.fillControl("a")
      await I.fillControl("")
      await I.blurControl()
      await I.seeError("Please fill out this field.")
    })

    test("onChange: error appears while typing", async () => {
      await I.setMode("onChange")
      await I.fillControl("taken@example.com")
      await I.seeError("This email is already taken")

      await I.fillControl("free@example.com")
      await I.dontSeeError()
    })

    test("valid indicator reflects tri-state validity: pristine shows neither", async () => {
      await I.dontSeeIndicator("valid")

      await I.setMode("onChange")
      await I.fillControl("free@example.com")
      await I.seeIndicator("valid")

      await I.fillControl("taken@example.com")
      await I.dontSeeIndicator("valid")
    })

    test("async validate resolves and stale results are discarded", async () => {
      await I.setMode("onChange")
      await I.toggleOption("Async validation")

      await I.fillControl("taken@example.com")
      await I.seeValidating()
      await I.seeError("This email is already taken")

      // a newer value supersedes the in-flight validation
      await I.fillControl("taken@example.com")
      await I.fillControl("free@example.com")
      await I.dontSeeError()
      await I.dontSeeControlAttr("data-invalid")
    })
  })

  test.describe("debounced validation", () => {
    test.beforeEach(async () => {
      await I.goto("debounced-validation")
    })

    test("validate waits for typing to pause, then runs once", async () => {
      await I.getControl().pressSequentially("taken@example.com", { delay: 40 })
      await I.dontSeeError()
      await I.seeValidating()
      await I.seeValidateCalls(0)

      await I.seeError("This email is already taken")
      await I.seeValidateCalls(1)
    })
  })

  test.describe("select", () => {
    test.beforeEach(async () => {
      await I.goto("select")
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("required empty select errors on submit and recovers on change", async () => {
      await I.submit()
      await I.seeError()
      await I.seeControlAttr("data-invalid")

      await I.selectOption("svelte")
      await I.dontSeeError()
      await I.seeControlAttr("data-valid")
      await I.seeControlAttr("data-filled")
    })
  })

  test.describe("custom messages", () => {
    test.beforeEach(async () => {
      await I.goto("custom-messages")
    })

    test("maps native failures to custom messages per validity key", async () => {
      // dirty the field so valueMissing is no longer suppressed, then empty + blur (onBlur mode)
      await I.fillControl("a")
      await I.fillControl("")
      await I.blurControl()
      await I.seeError("Please enter your website URL.")
      await I.seeErrorDescribed(true)

      await I.fillControl("not a url")
      await I.blurControl()
      await I.seeError("Enter a full URL, like https://example.com")
      await I.seeErrorDescribed(true)

      await I.fillControl("https://example.com")
      await I.blurControl()
      await I.dontSeeError()
      await I.seeErrorDescribed(false)
    })
  })

  test.describe("item", () => {
    test.beforeEach(async () => {
      await I.goto("item")
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("label points at the target item, not the sibling", async () => {
      await I.seeLabelPointsToAmount()
    })

    test("required empty amount errors on submit; currency change does not dirty the field", async () => {
      await I.selectCurrency("EUR")
      await I.dontSeeError()
      await I.dontSeeAmountAttr("data-dirty")

      await I.submit()
      await I.seeError()
      await I.seeBothControlsAriaInvalid()

      await I.fillAmount("12")
      await I.dontSeeError()
      await I.seeAmountAttr("data-valid")
    })
  })

  test.describe("textarea", () => {
    test.beforeEach(async () => {
      await I.goto("textarea-autoresize")
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("wires the same field state to a textarea control", async () => {
      await I.fillControl("x".repeat(120))
      await I.seeError("Keep it under 100 characters")
      await I.seeControlAttr("data-invalid")

      await I.fillControl("short bio")
      await I.dontSeeError()
      await I.seeControlAttr("data-valid")
    })
  })

  test.describe("form", () => {
    test.beforeEach(async () => {
      await I.goto("form")
    })

    test("should have no accessibility violations", async () => {
      await I.checkAccessibility()
    })

    test("submit focuses the first invalid field", async () => {
      await I.clickButton("Create account")
      await I.seeFocusedByLabel("Email")
      await I.seeInvalidByLabel("Email")
    })

    test("validate receives form values", async () => {
      await I.fillByLabel("Email", "sage@example.com")
      await I.fillByLabel("Password", "abcdefgh")
      await I.fillByLabel("Confirm password", "abcdefgx")
      await I.clickButton("Create account")
      await I.seeFocusedByLabel("Confirm password")
      await I.seeVisibleErrors(["Passwords don't match"])
    })

    test("server errors show until the value changes", async () => {
      await I.fillByLabel("Email", "taken@example.com")
      await I.fillByLabel("Password", "abcdefgh")
      await I.fillByLabel("Confirm password", "abcdefgh")
      await I.clickButton("Create account")
      await I.seeInvalidByLabel("Email")
      await I.seeVisibleErrors(["This email is already taken"])

      await I.fillByLabel("Email", "sage@example.com")
      await I.dontSeeInvalidByLabel("Email")

      await I.clickButton("Create account")
      await I.seeStatus("Submitted!")
    })

    test("server errors show again when the same error returns", async () => {
      await I.fillByLabel("Email", "taken@example.com")
      await I.fillByLabel("Password", "abcdefgh")
      await I.fillByLabel("Confirm password", "abcdefgh")
      await I.clickButton("Create account")
      await I.seeInvalidByLabel("Email")

      await I.fillByLabel("Email", "taken@example.co")
      await I.fillByLabel("Email", "taken@example.com")
      await I.dontSeeInvalidByLabel("Email")

      await I.clickButton("Create account")
      await I.seeInvalidByLabel("Email")
    })
  })

  test.describe("constraints", () => {
    test.beforeEach(async () => {
      await I.goto("constraints")
    })

    test("shows the message that matches each native constraint", async () => {
      await I.fillByLabel("Age", "5")
      await I.fillByLabel("Website", "nope")
      await I.fillByLabel("Username", "Ab!")
      await I.getByLabel("Age").focus()
      await I.seeVisibleErrors([
        "Use lowercase letters, numbers, or underscores.",
        "You must be at least 13.",
        "Enter a full URL, like https://example.com",
      ])
    })
  })

  test.describe("schema", () => {
    test.beforeEach(async () => {
      await I.goto("schema")
    })

    test("lists every schema error", async () => {
      await I.fillByLabel("Password", "abc")
      await expect(I.page.locator("[data-field-error-text] li")).toHaveText([
        "At least 8 characters",
        "One uppercase letter",
        "One number",
      ])

      await I.fillByLabel("Password", "Abcdefg1")
      await I.dontSeeInvalidByLabel("Password")
    })
  })

  test.describe("custom control", () => {
    test.beforeEach(async () => {
      await I.goto("custom-control")
    })

    test("labels the control and uses aria state", async ({ page }) => {
      const control = page.getByRole("textbox", { name: "Bio" })
      await expect(control).toHaveAttribute("aria-describedby", /helper-text/)

      await control.click()
      await I.type("x".repeat(45))
      await expect(control).toHaveAttribute("aria-invalid", "true")

      await I.getByLabel("Disabled").check()
      await expect(control).toHaveAttribute("aria-disabled", "true")
      await expect(control).not.toHaveAttribute("disabled")
    })
  })
})
