import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

const colors = {
  canvas: "#0f1211",
  surface: "#151918",
  ink: "#e6eae7",
  muted: "#9aa39e",
  line: "#232927",
  lineStrong: "#46504b",
  primary: "#34d27d",
}

const read = (path: string) => readFile(join(process.cwd(), path))

const toDataUri = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`

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
  const [logo, mark, regular, semibold, mono] = await Promise.all([
    read("public/brand/zag-logo-dark.svg"),
    read("public/brand/zag-mark.svg"),
    read("assets/og/wix-madefor-text-400.woff"),
    read("assets/og/wix-madefor-text-600.woff"),
    read("assets/og/geist-mono-400.woff"),
  ])

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
        backgroundImage:
          "radial-gradient(70% 90% at 100% 0%, rgba(0, 198, 94, 0.16) 0%, transparent 70%)",
      }}
    >
      <img
        src={toDataUri(mark.toString())}
        alt=""
        width={420}
        height={357}
        style={{ position: "absolute", right: -40, bottom: -70, opacity: 0.12 }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <img
          src={toDataUri(logo.toString().replaceAll("#ffffff", colors.ink))}
          alt="Zag"
          width={128}
          height={45}
        />
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
          maxWidth: 1000,
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
            display: "block",
            lineClamp: 2,
            fontSize: 30,
            lineHeight: 1.45,
            color: colors.muted,
          }}
        >
          {description}
        </div>
      </div>

      {code ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "flex-start",
            gap: 6,
            padding: "18px 24px",
            borderRadius: 14,
            border: `1px solid ${colors.line}`,
            backgroundColor: colors.surface,
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
          {footer}
        </div>
      )}
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Wix Madefor Text", data: regular, weight: 400 },
        { name: "Wix Madefor Text", data: semibold, weight: 600 },
        { name: "Geist Mono", data: mono, weight: 400 },
      ],
    },
  )
}
