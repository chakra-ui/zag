import Link from "next/link"

const routes = [
  {
    path: "/mobile-touch-end",
    name: "Mobile Touch End",
  },
  {
    path: "/select-controlled",
    name: "Select Controlled",
  },
  {
    path: "/select-search-params",
    name: "Select Search Params",
  },
]

export default function Page() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Zag.js + Next App</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
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
