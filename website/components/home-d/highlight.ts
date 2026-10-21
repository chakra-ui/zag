import { rehypeSvelte } from "lib/svelte-highlight"
import { rehype } from "rehype"

function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function highlight(code: string, lang: string) {
  const html = `<pre class="language-${lang}"><code class="language-${lang}">${escape(code.trim())}</code></pre>`
  return String(
    rehype()
      .data("settings", { fragment: true })
      .use(rehypeSvelte, { ignoreMissing: true })
      .processSync(html),
  )
}
