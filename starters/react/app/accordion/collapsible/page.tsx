"use client"

import { Accordion } from "@/components/accordion"

export default function Page() {
  return (
    <div style={{ padding: "40px", height: "200vh", maxWidth: "640px" }}>
      <h1>Accordion / Collapsible</h1>
      <Accordion
        multiple
        defaultValue={["home"]}
        items={[
          {
            value: "home",
            title: "Lorem Ipsum",
            description: `
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              proin in nisi elementum, egestas libero sed, pretium mi.
            `,
          },
          {
            value: "about",
            title: "Cake Ipsum",
            description: `
             Cake icing topping. I love sugar plum I love oat cake sweet.
              I love oat cake sweet. I love oat cake sweet.
              I love oat cake sweet. I love oat cake sweet.
            `,
          },
          {
            value: "contact",
            title: "Hummingbird Ipsum",
            description: `
            The humble cupcake. Tiramisu gingerbread jujubes sugar plum.
            Sweet roll sweet roll I love marzipan I love.
            fruitcake I love I love fruitcake.
            `,
          },
        ]}
      />
    </div>
  )
}
