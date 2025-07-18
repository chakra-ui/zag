import { createRoute } from "honox/factory"
import Avatar from "./$Avatar"

export default createRoute((c) => {
  return c.render(
    <div class="py-8 text-center">
      <title>Avatar</title>
      <h1 class="text-3xl font-bold">Avatar</h1>
      <Avatar
        name={"Segun Adebayo"}
        src={
          "https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png/revision/latest/scale-to-width-down/300?cb=20210223094656"
        }
      />
    </div>,
  )
})
