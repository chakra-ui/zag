"use client"

import { Accordion } from "@/components/accordion"

export default function Page() {
  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Accordion / Collapsible</h1>
      <Accordion
        multiple
        defaultValue={["home"]}
        items={[
          {
            value: "home",
            title: "Home",
            description: "Home description",
          },
          {
            value: "about",
            title: "About",
            description: "About description",
          },
          {
            value: "contact",
            title: "Contact",
            description: "Contact description",
          },
        ]}
      />
    </div>
  )
}
