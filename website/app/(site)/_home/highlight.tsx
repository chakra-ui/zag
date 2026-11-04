import type { ReactNode } from "react"
import { token } from "./home.css"

// Just enough highlighting for TS, JSX and CSS snippets
const pattern =
  /(\s+)|(\/\/.*$)|("[^"]*"|'[^']*')|\b(export|const|import|from|return)\b|(<\/?)([a-z]+)|(\[[a-z-]+\])|(\.[a-z][\w-]*)(?=\s*[{[])|([a-z][\w-]*)(?=:)|([A-Za-z_][\w]*)(?=\()|(\b\d+(?:\.\d+)?(?:px)?\b)|(\.\.\.|=>|[{}()[\]<>/=:;,.])|([A-Za-z_][\w-]*)|(.)/g

export function highlight(src: string): ReactNode[] {
  const out: ReactNode[] = []
  let m: RegExpExecArray | null
  let k = 0
  pattern.lastIndex = 0
  while ((m = pattern.exec(src))) {
    const [
      all,
      ws,
      comment,
      str,
      kw,
      open,
      tag,
      attr,
      selector,
      prop,
      fn,
      num,
      punct,
    ] = m
    const t = (cls: keyof typeof token, text: string) =>
      out.push(
        <span key={k++} className={token[cls]}>
          {text}
        </span>,
      )
    if (ws) out.push(ws)
    else if (comment) t("comment", comment)
    else if (str) t("string", str)
    else if (kw) t("keyword", kw)
    else if (open) {
      t("punct", open)
      t("tag", tag)
    } else if (attr) t("attr", attr)
    else if (selector) t("tag", selector)
    else if (prop) t("prop", prop)
    else if (fn) t("fn", fn)
    else if (num) t("num", num)
    else if (punct) t("punct", punct)
    else out.push(all)
  }
  return out
}
