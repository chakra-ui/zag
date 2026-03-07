import { defineHandler } from "nitro/h3"
import { componentRoutesData } from "@zag-js/shared"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head />

      <body>
        <div class="page">
          <Nav currentComponent={event.context.currentComponent as string} />

          <div class="index-nav">
            <h2>Zag.js + Alpine.js</h2>
            <ul>
              {componentRoutesData.map((component) => (
                <li>
                  <a href={`/${component.slug}`}>{component.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </body>
    </html>
  )
})
