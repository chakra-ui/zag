import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const ogSize = { width: 1200, height: 630 }

const colors = {
  canvas: "#0f1211",
  surface: "#151918",
  ink: "#e6eae7",
  muted: "#9aa39e",
  line: "#232927",
  lineStrong: "#46504b",
  primary: "#34d27d",
  solid: "#00c65e",
}

const read = (path: string) => readFile(join(process.cwd(), path))

async function loadAssets() {
  const [logo, mark, regular, semibold, mono] = await Promise.all([
    read("public/brand/zag-logo-dark.svg"),
    read("public/brand/zag-mark.svg"),
    read("assets/og/wix-madefor-text-400.woff"),
    read("assets/og/wix-madefor-text-600.woff"),
    read("assets/og/geist-mono-400.woff"),
  ])
  const svg = (buf: Buffer) =>
    `data:image/svg+xml;base64,${buf.toString("base64")}`
  return {
    logo: svg(Buffer.from(logo.toString().replaceAll("#ffffff", colors.ink))),
    mark: svg(mark),
    fonts: [
      { name: "Wix Madefor Text", data: regular, weight: 400 as const },
      { name: "Wix Madefor Text", data: semibold, weight: 600 as const },
      { name: "Geist Mono", data: mono, weight: 400 as const },
    ],
  }
}

interface OgImageProps {
  section?: string
  title: string
  description: string
  code?: string[]
  footer?: string
}

export async function renderOgImage({
  section,
  title,
  description,
  code,
  footer,
}: OgImageProps) {
  const { logo, mark, fonts } = await loadAssets()

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        fontFamily: "Wix Madefor Text",
        color: colors.ink,
        backgroundColor: colors.canvas,
        backgroundImage: `radial-gradient(70% 90% at 100% 0%, rgba(0, 198, 94, 0.16) 0%, transparent 70%)`,
      }}
    >
      <img
        src={mark}
        alt=""
        width={420}
        height={357}
        style={{ position: "absolute", right: -40, bottom: -70, opacity: 0.12 }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img src={logo} alt="Zag" width={128} height={45} />
        {section && (
          <div
            style={{
              display: "flex",
              paddingLeft: 20,
              borderLeft: `2px solid ${colors.lineStrong}`,
              fontSize: 28,
              color: colors.muted,
            }}
          >
            {section}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 940,
        }}
      >
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.45,
            color: colors.muted,
            lineClamp: 2,
            display: "block",
          }}
        >
          {description}
        </div>
      </div>

      {code?.length ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "flex-start",
            gap: 6,
            padding: "18px 24px",
            borderRadius: 14,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.line}`,
            fontFamily: "Geist Mono",
            fontSize: 24,
            color: colors.primary,
          }}
        >
          {code.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      ) : (
        <div
          style={{
            fontFamily: "Geist Mono",
            fontSize: 24,
            color: colors.muted,
          }}
        >
          {footer ?? "zagjs.com"}
        </div>
      )}
    </div>,
    { ...ogSize, fonts },
  )
}
