import { createRoute } from "honox/factory"
import Counter from "../islands/counter"

export default createRoute((c) => {
  return c.render(
    <div>
      <div class="py-8 text-center">
        <title>Hono + Zag</title>
        <h1 class="text-3xl font-bold">Hello, Hono!</h1>
        <Counter />
      </div>
      <div class="py-8 text-center">
        <h2 class="text-2xl font-bold">Examples</h2>
        <p>
          <a href="/accordion" class="text-blue-500 hover:underline">
            Accordion
          </a>
        </p>
        <p>
          <a href="/avatar" class="text-blue-500 hover:underline">
            Avatar
          </a>
        </p>
        <p>
          <a href="/checkbox" class="text-blue-500 hover:underline">
            Checkbox
          </a>
        </p>
        <p>
          <a href="/combobox" class="text-blue-500 hover:underline">
            Combobox
          </a>
        </p>
        <p>
          <a href="/popover" class="text-blue-500 hover:underline">
            Popover
          </a>
        </p>
      </div>
    </div>,
  )
})
