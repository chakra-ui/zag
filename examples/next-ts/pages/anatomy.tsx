import * as Anatomies from "@zag-js/anatomy-icons"
import { adjustHue, darken, desaturate, toHex } from "color2k"

const ACCENTS = ["red", "#2CFF80", "blue"]

export default function Page() {
  return (
    <div className="anatomy">
      {Object.entries(Anatomies).map(([name, Anatomy], i) => (
        <div className="anatomy__item" key={i}>
          <span>{name.replace("Anatomy", "")}</span>
          {ACCENTS.map((accent, i) => {
            const startColor = toHex(darken(desaturate(adjustHue(accent, 9), 0.52), 0.1))
            const stopColor = toHex(darken(desaturate(adjustHue(accent, 9), 0.43), 0.22))

            return (
              <div
                key={i}
                style={{
                  background: `linear-gradient(112deg, ${startColor} 0%, ${stopColor} 100%)`,
                }}
              >
                <Anatomy accentColor={accent} />
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
