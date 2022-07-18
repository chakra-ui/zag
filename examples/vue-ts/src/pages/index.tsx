import { routesData } from "@zag-js/shared"
import { RouterLink } from "vue-router"

export default function Page() {
  return (
    <div class="index-nav">
      <h2>Vue UI Machines</h2>
      <ul>
        {routesData.map((route) => (
          <li key={route.path}>
            <RouterLink to={route.path}>{route.label}</RouterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
