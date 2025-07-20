import { createRoute } from "honox/factory"
import Accordion from "./$Accordion"

export default createRoute((c) => {
  return c.render(
    <div class="py-8 text-center">
      <title>Accordion</title>
      <h1 class="text-3xl font-bold">Accordion</h1>
      <Accordion collapsible={true} multiple={false} />
    </div>,
  )
})
