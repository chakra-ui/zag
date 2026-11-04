import { cx } from "styled-system/css"
import { frameworks } from "./frameworks"
import {
  frameworkCard,
  frameworkGrid,
  frameworkName,
  frameworkPkg,
  frameworksHeader,
  frameworksLede,
  frameworksTitle,
} from "./frameworks.css"
import { section, wrap } from "./home.css"

export function FrameworksSection() {
  return (
    <section className={cx(wrap, section)} aria-label="Frameworks">
      <div className={frameworksHeader}>
        <h2 className={frameworksTitle}>One API across five frameworks</h2>
        <p className={frameworksLede}>
          Each component is one state machine with a thin adapter per framework.
          Switch frameworks without relearning a thing
        </p>
      </div>
      <div className={frameworkGrid}>
        {frameworks.map(({ name, pkg, Logo }) => (
          <div key={pkg} className={frameworkCard}>
            <Logo width="32" height="32" aria-hidden="true" />
            <div>
              <p className={frameworkName}>{name}</p>
              <p className={frameworkPkg}>{`@zag-js/${pkg}`}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
