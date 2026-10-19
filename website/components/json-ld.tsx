import siteConfig from "site.config"

/** Structured data search engines read for rich results */
export function JsonLd(props: { data: Record<string, unknown> }) {
  // escape "<" so content can't close the script tag early
  const json = JSON.stringify({
    "@context": "https://schema.org",
    ...props.data,
  })
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  )
}

export const absoluteUrl = (path: string) =>
  new URL(path, siteConfig.url).toString()
