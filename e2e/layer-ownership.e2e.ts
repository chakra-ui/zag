import { expect, test } from "@playwright/test"

test.describe("overlay ownership", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React ownership example")

  test.beforeEach(async ({ page }) => {
    await page.goto("/popover/layer-ownership")
    await page.getByRole("button", { name: "Open parent", exact: true }).click()
  })

  for (const removal of ["Toggle inside triggers", "Toggle parent content"]) {
    test(`closes an owned dialog after ${removal}`, async ({ page }) => {
      await page.getByRole("button", { name: "Inside trigger", exact: true }).click()
      await expect(page.getByTestId("child-state")).toHaveText("true")
      await page.getByRole("button", { name: removal, exact: true }).click()
      // A browser round trip lets MutationObserver deliver the removal before closing.
      await expect(page.getByRole("button", { name: "Inside trigger", exact: true })).toHaveCount(0)
      await page.getByRole("button", { name: "Close parent", exact: true }).click()
      await expect(page.getByTestId("child-state")).toHaveText("false")
    })
  }

  test("owns a dialog opened by the default trigger", async ({ page }) => {
    await page.getByRole("button", { name: "Default inside trigger", exact: true }).click()
    await expect(page.getByTestId("child-state")).toHaveText("true")
    await page.getByRole("button", { name: "Close parent", exact: true }).click()
    await expect(page.getByTestId("child-state")).toHaveText("false")
  })

  for (const [first, second, closes] of [
    ["Inside trigger", "Outside trigger", false],
    ["Outside trigger", "Inside trigger", true],
  ] as const) {
    test(`updates ownership when switching from ${first} to ${second}`, async ({ page }) => {
      await page.getByRole("button", { name: first, exact: true }).click()
      await expect(page.getByTestId("child-state")).toHaveText("true")
      await page.getByRole("button", { name: second, exact: true }).click()
      await expect(page.getByRole("button", { name: second, exact: true })).toHaveAttribute("data-current", "")
      await page.getByRole("button", { name: "Close parent", exact: true }).click()
      await expect(page.getByTestId("child-state")).toHaveText(String(!closes))
    })
  }

  test("programmatic reopening does not inherit the previous trigger's owner", async ({ page }) => {
    await page.getByRole("button", { name: "Inside trigger", exact: true }).click()
    await page.getByRole("button", { name: "Close child", exact: true }).click()
    await expect(page.getByTestId("child-state")).toHaveText("false")
    await page.getByRole("button", { name: "Open child from code", exact: true }).click()
    await expect(page.getByTestId("child-state")).toHaveText("true")
    await page.getByRole("button", { name: "Close parent", exact: true }).click()
    await expect(page.getByTestId("child-state")).toHaveText("true")
  })
})

test.describe("controlled overlay ownership", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React ownership example")
  for (const selected of ["outside", "inside"]) {
    test(`follows controlled selection of ${selected} without replacing content`, async ({ page }) => {
      await page.goto("/popover/layer-ownership")
      await page.getByLabel("Control selected trigger").check()
      await page.getByRole("button", { name: "Open parent", exact: true }).click()
      await page.getByRole("button", { name: "Inside trigger", exact: true }).click()
      // Switch both ways while the same content node remains mounted.
      await page.getByLabel("Selected trigger", { exact: true }).selectOption("outside")
      await page.getByLabel("Selected trigger", { exact: true }).selectOption(selected)
      await expect(
        page.getByRole("button", { name: selected === "inside" ? "Inside trigger" : "Outside trigger", exact: true }),
      ).toHaveAttribute("data-current", "")
      await page.getByRole("button", { name: "Close parent", exact: true }).click()
      await expect(page.getByTestId("child-state")).toHaveText(String(selected === "outside"))
    })
  }
  test("a rejected trigger switch retains the controlled owner", async ({ page }) => {
    await page.goto("/popover/layer-ownership")
    await page.getByLabel("Control selected trigger").check()
    await page.getByRole("button", { name: "Open parent", exact: true }).click()
    await page.getByRole("button", { name: "Inside trigger", exact: true }).click()
    await page.getByRole("button", { name: "Outside trigger", exact: true }).click()
    await expect(page.getByRole("button", { name: "Inside trigger", exact: true })).toHaveAttribute("data-current", "")
    await page.getByRole("button", { name: "Close parent", exact: true }).click()
    await expect(page.getByTestId("child-state")).toHaveText("false")
  })
})

test("uses an explicit trigger selected through the API before programmatic opening", async ({ page }) => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React ownership example")
  await page.goto("/popover/layer-ownership")
  await page.getByRole("button", { name: "Open parent", exact: true }).click()
  await page.getByRole("button", { name: "Select inside trigger", exact: true }).click()
  await expect(page.getByTestId("child-state")).toHaveText("false")
  await page.getByRole("button", { name: "Open child from code", exact: true }).click()
  await expect(page.getByTestId("child-state")).toHaveText("true")
  await page.getByRole("button", { name: "Close parent", exact: true }).click()
  await expect(page.getByTestId("child-state")).toHaveText("false")
})
