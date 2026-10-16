import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }

interface OgImageProps {
  section: string
  title: string
  description: string
}

/** The share card for a docs page: section, title and description on the brand colors */
export function renderOgImage({ section, title, description }: OgImageProps) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#18181b",
        color: "#fafafa",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
          zag
        </div>
        <div
          style={{
            width: 4,
            height: 36,
            background: "#00C65E",
            rotate: "20deg",
          }}
        />
        <div style={{ fontSize: 28, color: "#a1a1aa" }}>{section}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            color: "#d4d4d8",
            maxWidth: 960,
          }}
        >
          {description}
        </div>
      </div>
      <div style={{ height: 8, width: 160, background: "#00C65E" }} />
    </div>,
    ogSize,
  )
}
