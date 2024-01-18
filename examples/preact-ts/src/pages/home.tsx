import { routesData } from "@zag-js/shared"

export default function Home() {
  return (
    <div class="index-nav">
      <h2>Zag.js + Solid</h2>
      <ul>
        {routesData
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((route) => (
            <li>
              <a href={route.path}>{route.label}</a>
            </li>
          ))}
      </ul>
    </div>
  )
}
