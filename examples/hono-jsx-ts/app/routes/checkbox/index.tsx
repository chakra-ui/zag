import { createRoute } from "honox/factory"
import Checkbox from "./$Checkbox"

export default createRoute((c) => {
  return c.render(
    <div class="py-8 text-center">
      <title>Checkbox</title>
      <h1 class="text-3xl font-bold">Checkbox</h1>
      <Checkbox disabled={false} invalid={false} />
    </div>,
  )
})
