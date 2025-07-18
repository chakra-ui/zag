import { createRoute } from "honox/factory"
import Popover from "./$Popover"

export default createRoute((c) => {
  return c.render(
    <div class="py-8 text-center">
      <title>Popover</title>
      <h1 class="text-3xl font-bold">Popover</h1>
      <Popover modal={false} portalled={false} autoFocus={true} closeOnInteractOutside={true} closeOnEscape={true} />
    </div>,
  )
})
