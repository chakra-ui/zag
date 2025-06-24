declare module "json-format-highlight" {
  export interface FormatOptions {
    keyColor?: string | undefined
    numberColor?: string | undefined
    stringColor?: string | undefined
    trueColor?: string | undefined
    falseColor?: string | undefined
    nullColor?: string | undefined
  }

  export default function formatHighlight(code: string, options?: Options): string
}
