import { componentRoutesData } from "@zag-js/shared"

export default function Home() {
  return (
    <div class="index-nav">
      <h2>Zag.js + Preact</h2>
      <ul>
        {componentRoutesData.map((component) => (
          <li key={component.slug}>
            <a href={`/${component.slug}`}>{component.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
