import { CopyHex, CopySnippet } from "app/(site)/brand/_components/brand-copy"
import { TwoToneHeading } from "components/ui/heading"
import {
  colors,
  donts,
  dos,
  html,
  logos,
  markdown,
  type Asset,
} from "lib/brand"
import { createPageMetadata } from "lib/seo"
import type { ReactNode } from "react"
import { Box } from "styled-system/jsx"
import { brand, community, pageHeader } from "styled-system/recipes"
import { gutter } from "../_components/shared"

export const metadata = createPageMetadata({
  title: "Brand",
  description:
    "Zag.js logo files, colours, usage notes and a Built with Zag badge.",
  path: "/brand",
})

function Section(props: {
  id: string
  title: string
  lead: ReactNode
  children: ReactNode
}) {
  const styles = community()
  return (
    <section
      id={props.id}
      className={styles.section}
      aria-labelledby={`${props.id}-title`}
    >
      <div>
        <h2 id={`${props.id}-title`} className={styles.sectionTitle}>
          {props.title}
        </h2>
        <p className={styles.sectionLead}>{props.lead}</p>
      </div>
      {props.children}
    </section>
  )
}

function Downloads(props: { items: Asset[] }) {
  const styles = brand()
  return (
    <div className={styles.downloads}>
      {props.items.map((item) => (
        <div key={item.file} className={styles.row}>
          {item.label && <span className={styles.label}>{item.label}</span>}
          {["svg", "png"].map((ext) => (
            <a
              key={ext}
              href={`/brand/${item.file}.${ext}`}
              download
              aria-label={`Download ${item.file}.${ext}`}
              className={styles.download}
            >
              {ext} ↓
            </a>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function BrandPage() {
  const header = pageHeader()
  const two = brand()
  const four = brand({ columns: "four" })

  return (
    <Box maxW="1440px" mx="auto" px={gutter} pb="24">
      <header className={header.root}>
        <div className={header.copy}>
          <p className={header.eyebrow}>Brand</p>
          <TwoToneHeading
            as="h1"
            title="Zag brand assets"
            accent="for referring to Zag"
            size="display"
          />
          <p className={header.lead}>
            Logo files, colours and a badge for referring to Zag. Using them
            does not mean Zag endorses your project.
          </p>
        </div>
      </header>

      <Section
        id="logo"
        title="Logo"
        lead="The wordmark with the green slash. SVG for the web, PNG at 4x for everything else."
      >
        <div className={two.grid}>
          {logos.map((logo) => (
            <div key={logo.name} className={two.card}>
              <div className={two.previews}>
                {logo.previews.map((preview) => (
                  <div
                    key={preview.file}
                    className={two.preview}
                    data-tone={preview.tone}
                  >
                    <img
                      src={`/brand/${preview.file}`}
                      alt={preview.alt}
                      data-size={preview.size}
                    />
                  </div>
                ))}
              </div>
              <div className={two.meta}>
                <div>
                  <h3 className={two.name}>{logo.name}</h3>
                  <p className={two.note}>{logo.note}</p>
                </div>
                <Downloads items={logo.downloads} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="colour"
        title="Colour"
        lead="One green for the mark. The site runs on neutral greys with a quieter green for accents."
      >
        <div className={four.grid}>
          {colors.map((color) => (
            <div key={color.hex} className={four.card}>
              <div className={four.swatch} style={{ background: color.hex }} />
              <div>
                <h3 className={four.name}>{color.name}</h3>
                <p className={four.note}>{color.use}</p>
              </div>
              <CopyHex value={color.hex} label={color.name} />
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="usage"
        title="Usage"
        lead="A few rules so the logo reads the same everywhere."
      >
        <div className={two.grid}>
          {[
            { title: "Do", kind: "do", items: dos },
            { title: "Don't", kind: "dont", items: donts },
          ].map((column) => (
            <div key={column.kind} className={`${two.card} ${two.rules}`}>
              <p className={two.ruleTitle}>{column.title}</p>
              <ul className={two.list}>
                {column.items.map((item) => (
                  <li key={item} className={two.item}>
                    <span
                      aria-hidden
                      className={two.sign}
                      data-kind={column.kind}
                    >
                      {column.kind === "do" ? "+" : "−"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="badge"
        title="Built with Zag"
        lead="Add it to your README or site footer. It links back to zagjs.com."
      >
        <div className={two.grid}>
          <div className={two.card}>
            <div className={two.previews}>
              <div className={two.preview} data-tone="light">
                <img
                  src="/brand/built-with-zag-light.svg"
                  alt="Built with Zag badge, light"
                  data-size="badge"
                />
              </div>
              <div className={two.preview} data-tone="dark">
                <img
                  src="/brand/built-with-zag-dark.svg"
                  alt="Built with Zag badge, dark"
                  data-size="badge"
                />
              </div>
            </div>
            <Downloads
              items={[
                { label: "Light", file: "built-with-zag-light" },
                { label: "Dark", file: "built-with-zag-dark" },
              ]}
            />
          </div>
          <div className={two.card}>
            <CopySnippet label="Markdown" value={markdown} />
            <CopySnippet label="HTML" value={html} />
          </div>
        </div>
      </Section>
    </Box>
  )
}
