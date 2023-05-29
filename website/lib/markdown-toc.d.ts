declare module "markdown-toc" {
  type TOCOptions = {
    append?: string
    filter?: Function
    slugify?: Function
    bullets?: string | Array<string>
    maxdepth?: number
    firsth1?: boolean
  }
  export default function toc(
    str: string,
    options?: TOCOptions,
  ): {
    json: Array<{ content: string; slug: string; lvl: number }>
  }
}
