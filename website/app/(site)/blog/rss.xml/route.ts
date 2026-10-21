import { posts } from "lib/source"
import siteConfig from "site.config"

export const dynamic = "force-static"

const escape = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function GET() {
  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}/blog/${post.slug}`
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escape(post.description)}</description>
      <pubDate>${post.date.toUTCString()}</pubDate>
    </item>`
    })
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Zag blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>Release notes, deep dives and updates from the Zag team.</description>
    <language>en</language>
    <atom:link href="${siteConfig.url}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  })
}
