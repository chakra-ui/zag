export type Asset = { label: string; file: string }

export const logos: {
  name: string
  note: string
  previews: {
    tone: "light" | "dark"
    file: string
    alt: string
    size: "logo" | "mark"
  }[]
  downloads: Asset[]
}[] = [
  {
    name: "Logo, light",
    note: "Dark wordmark for light backgrounds",
    previews: [
      {
        tone: "light",
        file: "zag-logo-light.svg",
        alt: "Zag logo",
        size: "logo",
      },
    ],
    downloads: [{ label: "", file: "zag-logo-light" }],
  },
  {
    name: "Logo, dark",
    note: "White wordmark for dark backgrounds",
    previews: [
      {
        tone: "dark",
        file: "zag-logo-dark.svg",
        alt: "Zag logo",
        size: "logo",
      },
    ],
    downloads: [{ label: "", file: "zag-logo-dark" }],
  },
  {
    name: "Mark",
    note: "The slash alone, for avatars and small spaces",
    previews: [
      { tone: "light", file: "zag-mark.svg", alt: "Zag mark", size: "mark" },
    ],
    downloads: [{ label: "", file: "zag-mark" }],
  },
  {
    name: "Mark, mono",
    note: "Single colour, when green is not an option",
    previews: [
      {
        tone: "light",
        file: "zag-mark-black.svg",
        alt: "Zag mark, black",
        size: "mark",
      },
      {
        tone: "dark",
        file: "zag-mark-white.svg",
        alt: "Zag mark, white",
        size: "mark",
      },
    ],
    downloads: [
      { label: "Black", file: "zag-mark-black" },
      { label: "White", file: "zag-mark-white" },
    ],
  },
]

export const colors = [
  { name: "Zag green", hex: "#00C65E", use: "Logo slash" },
  { name: "Green 650", hex: "#287A51", use: "UI accent, light" },
  { name: "Green 350", hex: "#4ADE80", use: "UI accent, dark" },
  { name: "Gray 900", hex: "#18181B", use: "Wordmark" },
  { name: "Gray 925", hex: "#0B0B0C", use: "Page, dark" },
  { name: "Gray 600", hex: "#52525B", use: "Muted text, light" },
  { name: "Gray 400", hex: "#A1A1AA", use: "Muted text, dark" },
  { name: "Gray 200", hex: "#E4E4E7", use: "Borders, light" },
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
