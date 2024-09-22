import { component$ } from "@builder.io/qwik"
import { Link } from "@builder.io/qwik-city"
import { routesData } from "@zag-js/shared"

export default component$(() => {
  return (
    <div class="index-nav">
      <h2>Zag.js + Qwik</h2>
      <ul>
        {routesData.map((route) => (
          <li key={route.path}>
            <Link href={route.path}>{route.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
})
