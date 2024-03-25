import Link from "next/link"

const routes = [
  { path: "/select/mobile-touch-end", name: "Select - Mobile Touch End" },
  { path: "/select/controlled", name: "Select - Controlled" },
  { path: "/select/search-params", name: "Select - Search Params" },
  { path: "/select/virtualized", name: "Select - Virtualized" },
  { path: "/dialog/controlled", name: "Dialog - Controlled" },
  { path: "/popover/controlled", name: "Popover - Controlled" },
  { path: "/color-picker/controlled", name: "ColorPicker - Controlled" },
  { path: "/date-picker/controlled-range-picker", name: "DateRangePicker - Controlled" },
  { path: "/hover-card/controlled", name: "HoverCard - Controlled" },
  { path: "/tooltip/controlled", name: "Tooltip - Controlled" },
  { path: "/menu/controlled", name: "Menu - Controlled" },
  { path: "/collapsible/controlled", name: "Collapsible - Controlled" },
  { path: "/collapsible/uncontrolled", name: "Collapsible - Uncontrolled" },
  { path: "/accordion/collapsible", name: "Accordion + Collapsible" },
]

export default function Page() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Zag.js + Next App</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {routes.map((route) => (
          <Link key={route.path} href={route.path} style={{ padding: "20px", border: "1px solid lightgray" }}>
            {route.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
