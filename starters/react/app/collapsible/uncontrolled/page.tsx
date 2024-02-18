"use client"

import { Collapsible } from "@/components/collapsible"

export default function Page() {
  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Collapsible Uncontrolled</h1>

      <Collapsible defaultOpen>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum. <a href="#">Some Link</a>
        </p>
      </Collapsible>
    </div>
  )
}
