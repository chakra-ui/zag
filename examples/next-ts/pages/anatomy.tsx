import * as Anatomies from "@zag-js/anatomy-icons"

// const Anatomy = Anatomies.TooltipAnatomy

const ACCENTS = {
  "#2CFF80": "linear-gradient(112deg, #41B883 0%, #299464 100%)",
  red: "linear-gradient(112deg, #BB4141 0%, #942929 100%)",
  blue: "linear-gradient(112deg, #4341B8 0%, #2B2994 100%)",
}

export default function Page() {
  return (
    <div
      className="anatomy"
      style={{ position: "fixed", top: 0, bottom: 0, left: 0, overflow: "auto", maxHeight: "100%" }}
    >
      {Object.entries(Anatomies).map(([name, Anatomy], i) => (
        <div style={{ display: "flex", overflow: "auto", width: "100%", position: "relative" }} key={i}>
          <span style={{ position: "absolute", top: 2, left: 2, fontWeight: "500" }}>{name}</span>
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
