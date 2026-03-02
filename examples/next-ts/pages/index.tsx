import { componentRoutesData } from "@zag-js/shared"
import Link from "next/link"

const Page = () => {
  return (
    <div className="index-nav">
      <h2>Zag.js + React Components</h2>
      <ul>
        {componentRoutesData.map((component) => (
          <li key={component.slug}>
            <Link href={`/${component.slug}`}>{component.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Page
