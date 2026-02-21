import { defineHandler } from "nitro/h3"
import { routesData } from "@zag-js/shared"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head />

      <body>
        <div class="page">
          <Nav pathname={event.url.pathname} />

          <div class="index-nav">
            <h2>Zag.js + Alpine.js</h2>
            <ul>
              {routesData.map((route) => (
                <li>
                  <a href={route.path}>{route.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </body>
    </html>
  )
})
