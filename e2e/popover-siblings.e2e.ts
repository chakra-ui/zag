import { expect, test, type Locator, type Page } from "./_test"

type Env = "document" | "shadow" | "iframe" | "mixed-shadow" | "mixed-iframe"

function setup(page: Page, env: Env, touch: boolean) {
  const root = env === "iframe" ? page.locator("iframe").first().contentFrame() : page

  const scopeOf = (name: string) =>
    env === "mixed-iframe" && name === "deep" ? page.locator("[data-testid=wrap-content] iframe").contentFrame() : root

  const trigger = (name: string) => scopeOf(name).getByTestId(`${name}-trigger`)

  const press = async (loc: Locator, options: { position?: { x: number; y: number }; force?: boolean } = {}) => {
    const { position = { x: 4, y: 4 }, force } = options
    if (touch) await loc.tap({ position, force })
    else await loc.click({ position, force })
  }

  const open = async (...names: string[]) => {
    for (const name of names) {
      await press(trigger(name))
      await expect(trigger(name)).toHaveAttribute("data-state", "open")
    }
  }

  const expectStates = async (states: Record<string, "open" | "closed">) => {
    for (const [name, state] of Object.entries(states)) {
      await expect(trigger(name)).toHaveAttribute("data-state", state)
    }
  }

  return {
    trigger,
    open,
    expectStates,
    press: (name: string) => press(trigger(name)),
    pressContent: (name: string) => press(scopeOf(name).getByTestId(`${name}-content`)),
    // Bottom edge, below open content. Unstyled content can still overlap, so skip the hit-target check
    pressOutside: async () => {
      const blank = root.getByTestId("blank")
      const box = await blank.boundingBox()
      await press(blank, { position: { x: 4, y: box!.height - 4 }, force: true })
    },
  }
}

async function goto(page: Page, query: string) {
  await page.goto(`/popover/siblings?${query}`)
  await expect(page.locator("main[data-env]")).toBeVisible()
}

test.describe("popover siblings", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  for (const touch of [false, true]) {
    test.describe(touch ? "touch" : "mouse", () => {
      if (touch) test.use({ hasTouch: true, isMobile: true, viewport: { width: 412, height: 915 } })

      for (const env of ["document", "shadow", "iframe"] as const) {
        for (const portal of [true, false]) {
          test.describe(`${env}, portal=${portal}`, () => {
            test.beforeEach(async ({ page }) => {
              await goto(page, `env=${env}&portal=${portal}`)
            })

            test("opening a sibling popover closes only the open one", async ({ page }) => {
              const t = setup(page, env, touch)
              await t.open("a")
              await t.press("b")
              await t.expectStates({ a: "closed", b: "open" })
            })

            test("opening a sibling menu closes only the open one", async ({ page }) => {
              const t = setup(page, env, touch)
              await t.open("menu-a")
              await t.press("menu-b")
              await t.expectStates({ "menu-a": "closed", "menu-b": "open" })
            })

            test("interacting inside a nested popover keeps its parent open", async ({ page }) => {
              const t = setup(page, env, touch)
              await t.open("parent", "child")
              await t.pressContent("child")
              await t.expectStates({ parent: "open", child: "open" })
            })

            test("clicking outside closes a parent and its nested popover", async ({ page }) => {
              const t = setup(page, env, touch)
              await t.open("parent", "child")
              await t.pressOutside()
              await t.expectStates({ parent: "closed", child: "closed" })
            })
          })
        }
      }

      test("a popover inside a shadow root is a sibling of one outside it", async ({ page }) => {
        await goto(page, "env=mixed-shadow")
        const t = setup(page, "mixed-shadow", touch)
        await t.open("outer")
        await t.press("inner")
        await t.expectStates({ outer: "closed", inner: "open" })
      })

      test("a popover inside an iframe in a popover nests in it", async ({ page }) => {
        await goto(page, "env=mixed-iframe")
        const t = setup(page, "mixed-iframe", touch)
        await t.open("wrap", "deep")
        await t.expectStates({ wrap: "open", deep: "open" })

        await t.pressContent("deep")
        await t.expectStates({ wrap: "open", deep: "open" })

        await t.pressOutside()
        await t.expectStates({ wrap: "closed" })
      })
    })
  }
})
