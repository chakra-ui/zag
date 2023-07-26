import { allComponents, createGradient } from "@zag-js/anatomy-icons"

const ACCENTS = ["red", "#2CFF80", "blue"]

export default function Page() {
  return (
    <div className="anatomy">
      {Object.entries(allComponents).map(([name, Anatomy], i) => (
        <div className="anatomy__item" key={i}>
          <span>{name.replace("Anatomy", "")}</span>
          {ACCENTS.map((accent, i) => {
            return (
              <div key={i} style={{ background: createGradient(accent).value }}>
                <Anatomy accentColor={accent} />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
