import * as Anatomies from "@zag-js/anatomy-icons"

const ACCENTS = {
  "#2CFF80": "linear-gradient(112deg, #41B883 0%, #299464 100%)",
  red: "linear-gradient(112deg, #BB4141 0%, #942929 100%)",
  blue: "linear-gradient(112deg, #4341B8 0%, #2B2994 100%)",
}

export default function Page() {
  return (
    <div className="anatomy">
      {Object.entries(Anatomies).map(([name, Anatomy], i) => (
        <div className="anatomy__item" key={i}>
          <span>{name}</span>
          {Object.entries(ACCENTS).map(([accent, background], i) => (
            <div
              key={i}
              style={{
                background,
              }}
            >
              <Anatomy accentColor={accent} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
