declare module "json-format-highlight" {
  export interface FormatOptions {
    keyColor?: string
    numberColor?: string
    stringColor?: string
    trueColor?: string
    falseColor?: string
    nullColor?: string
  }

  export default function formatHighlight(code: string, options?: Options): string
}
