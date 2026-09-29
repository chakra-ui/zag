import { render, screen, fireEvent } from "@solidjs/testing-library"
import * as accordion from "@zag-js/accordion"
import * as checkbox from "@zag-js/checkbox"
import { createMemo, createSignal, flush, For, Show } from "solid-js"
import { Key, normalizeProps, useMachine } from "../src"

const tick = () => new Promise((resolve) => setTimeout(resolve))

// Focus and click in the same tick: the click is only handled once the focus transition is applied
const press = (el: HTMLElement) => {
  fireEvent.focusIn(el)
  fireEvent.click(el)
}

const items = ["a", "b"]

function Accordion(props: { value?: string[]; onValueChange?: (details: accordion.ValueChangeDetails) => void }) {
  const service = useMachine(accordion.machine, () => ({
    id: "accordion",
    value: props.value,
    onValueChange: props.onValueChange,
  }))
  const api = createMemo(() => accordion.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <For each={items}>
        {(item) => (
          <div {...api().getItemProps({ value: item })}>
            <button data-testid={`${item}:trigger`} {...api().getItemTriggerProps({ value: item })}>
              {item}
            </button>
            <div data-testid={`${item}:content`} {...api().getItemContentProps({ value: item })}>
              Content {item}
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

function Checkbox() {
  const service = useMachine(checkbox.machine, { id: "checkbox" })
  const api = createMemo(() => checkbox.connect(service, normalizeProps))

  return (
    <>
      <label {...api().getRootProps()}>
        <div data-testid="control" {...api().getControlProps()} />
        <input data-testid="input" {...api().getHiddenInputProps()} />
      </label>
      <button data-testid="toggle" onClick={() => api().toggleChecked()}>
        Toggle
      </button>
    </>
  )
}

describe("components", () => {
  let warn: ReturnType<typeof vi.spyOn>
  let error: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warn = vi.spyOn(console, "warn")
    error = vi.spyOn(console, "error")
  })

  afterEach(() => {
    // Solid 2 reports reactivity misuse (strict reads, owned writes, flush) through the console
    expect(warn).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  test("renders boolean aria attributes as strings", async () => {
    render(() => <Accordion />)
    await tick()

    const trigger = screen.getByTestId("a:trigger")
    const content = screen.getByTestId("a:content")

    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger).toHaveAttribute("data-state", "closed")
    expect(content).toHaveAttribute("hidden")

    press(trigger)
    await tick()

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger).toHaveAttribute("data-state", "open")
    expect(content).not.toHaveAttribute("hidden")
  })

  test("follows controlled props", async () => {
    const [value, setValue] = createSignal<string[]>([])
    const onValueChange = vi.fn()

    render(() => <Accordion value={value()} onValueChange={onValueChange} />)
    await tick()

    const trigger = screen.getByTestId("b:trigger")
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    // controlled: clicking only reports the change
    press(trigger)
    await tick()
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["b"] }))
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    setValue(["b"])
    flush()
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByTestId("b:content")).not.toHaveAttribute("hidden")
  })

  test("syncs the hidden input through a tracked watcher", async () => {
    render(() => <Checkbox />)
    await tick()

    const input = screen.getByTestId("input") as HTMLInputElement
    const control = screen.getByTestId("control")

    expect(input.checked).toBe(false)
    expect(input).toHaveAttribute("aria-invalid", "false")
    expect(control).toHaveAttribute("data-state", "unchecked")

    fireEvent.click(screen.getByTestId("toggle"))
    await tick()

    expect(input.checked).toBe(true)
    expect(control).toHaveAttribute("data-state", "checked")
  })

  test("stops the machine on unmount", async () => {
    const [show, setShow] = createSignal(true)
    render(() => (
      <Show when={show()}>
        <Accordion />
      </Show>
    ))
    await tick()

    press(screen.getByTestId("a:trigger"))
    await tick()

    setShow(false)
    flush()
    await tick()

    expect(screen.queryByTestId("a:trigger")).toBeNull()
  })

  test("Key reuses nodes with the same key", async () => {
    const [list, setList] = createSignal([
      { id: 1, label: "one" },
      { id: 2, label: "two" },
    ])

    render(() => (
      <ul>
        <Key each={list()} by="id">
          {(item) => <li data-testid={`item-${item().id}`}>{item().label}</li>}
        </Key>
      </ul>
    ))

    const first = screen.getByTestId("item-1")

    setList([
      { id: 2, label: "two" },
      { id: 1, label: "uno" },
    ])
    flush()

    expect(screen.getByTestId("item-1")).toBe(first)
    expect(first).toHaveTextContent("uno")
  })
})
