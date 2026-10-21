export const LIGHT = "#ffffff"
export const DARK = "#18181b"
export type Asset = { label: string; file: string }

export const logos: {
  name: string
  note: string
  previews: { bg: string; file: string; alt: string; h: string }[]
  downloads: Asset[]
}[] = [
  {
    name: "Logo, light",
    note: "Dark wordmark for light backgrounds",
    previews: [
      { bg: LIGHT, file: "zag-logo-light.svg", alt: "Zag logo", h: "12" },
    ],
    downloads: [{ label: "", file: "zag-logo-light" }],
  },
  {
    name: "Logo, dark",
    note: "White wordmark for dark backgrounds",
    previews: [
      { bg: DARK, file: "zag-logo-dark.svg", alt: "Zag logo", h: "12" },
    ],
    downloads: [{ label: "", file: "zag-logo-dark" }],
  },
  {
    name: "Mark",
    note: "The slash alone, for avatars and small spaces",
    previews: [{ bg: LIGHT, file: "zag-mark.svg", alt: "Zag mark", h: "14" }],
    downloads: [{ label: "", file: "zag-mark" }],
  },
  {
    name: "Mark, mono",
    note: "Single colour, when green is not an option",
    previews: [
      {
        bg: LIGHT,
        file: "zag-mark-black.svg",
        alt: "Zag mark, black",
        h: "14",
      },
      { bg: DARK, file: "zag-mark-white.svg", alt: "Zag mark, white", h: "14" },
    ],
    downloads: [
      { label: "Black", file: "zag-mark-black" },
      { label: "White", file: "zag-mark-white" },
    ],
  },
]

export const colors = [
  { name: "Zag green", hex: "#00C65E", use: "Logo slash" },
  { name: "Green 600", hex: "#2F855A", use: "UI accent, light" },
  { name: "Green 400", hex: "#48BB78", use: "UI accent, dark" },
  { name: "Gray 900", hex: "#18181B", use: "Wordmark, dark surface" },
  { name: "Gray 600", hex: "#52525B", use: "Muted text, light" },
  { name: "Gray 400", hex: "#A1A1AA", use: "Muted text, dark" },
  { name: "Gray 200", hex: "#E4E4E7", use: "Borders, light" },
  { name: "Gray 50", hex: "#FAFAFA", use: "Text, dark" },
]

export const dos = [
  "Keep clear space around the logo, at least the height of the slash.",
  "Use the light logo on light backgrounds and the dark logo on dark ones.",
  "Use the mono mark when the background fights the green.",
  "Link the logo or badge to zagjs.com.",
]

export const donts = [
  "Recolour the slash or the wordmark.",
  "Stretch, rotate, outline or add effects.",
  "Rebuild the wordmark in another typeface.",
  "Use the logo to suggest Zag endorses your product.",
]

export const site = "https://zagjs.com"

export const markdown = `[![Built with Zag](${site}/brand/built-with-zag-light.svg)](${site})`

export const html = `<a href="${site}">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${site}/brand/built-with-zag-dark.svg" />
    <img src="${site}/brand/built-with-zag-light.svg" alt="Built with Zag" height="28" />
  </picture>
</a>`
