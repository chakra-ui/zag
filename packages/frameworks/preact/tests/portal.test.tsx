import { render } from "@testing-library/preact"
import { Portal } from "../src"
import { flush } from "./render"

describe("preact Portal", () => {
  afterEach(() => {
    document.body.querySelectorAll("[data-portaled]").forEach((el) => el.remove())
  })

  test("renders children into document.body without throwing", async () => {
    // the compat-hooks crash only reproduces under a real bundler; the e2e suite guards that
    render(
      <Portal>
        <div data-portaled="a">hello</div>
      </Portal>,
    )
    await flush()

    const el = document.querySelector('[data-portaled="a"]')
    expect(el).not.toBeNull()
    expect(el?.parentElement).toBe(document.body)
  })

  test("renders multiple children", async () => {
    render(
      <Portal>
        <div data-portaled="one" />
        <div data-portaled="two" />
      </Portal>,
    )
    await flush()

    expect(document.querySelector('[data-portaled="one"]')).not.toBeNull()
    expect(document.querySelector('[data-portaled="two"]')).not.toBeNull()
  })

  test("disabled renders in place instead of portaling", async () => {
    const { container } = render(
      <Portal disabled>
        <div data-portaled="inline" />
      </Portal>,
    )
    await flush()

    expect(container.querySelector('[data-portaled="inline"]')).not.toBeNull()
  })

  test("honours a container ref", async () => {
    const host = document.createElement("div")
    document.body.appendChild(host)

    render(
      <Portal container={{ current: host }}>
        <div data-portaled="scoped" />
      </Portal>,
    )
    await flush()

    expect(host.querySelector('[data-portaled="scoped"]')).not.toBeNull()
    host.remove()
  })
})
