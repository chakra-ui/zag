import { createRoute } from "honox/factory"
import Combobox from "./$Combobox"

export default createRoute((c) => {
  return c.render(
    <div class="py-8 text-center">
      <title>Combobox</title>
      <h1 class="text-3xl font-bold">Combobox</h1>
      <Combobox
        disabled={false}
        readOnly={false}
        loopFocus={false}
        inputBehavior={"autohighlight"}
        selectionBehavior={"replace"}
      />
    </div>,
  )
})
