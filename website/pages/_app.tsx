import { DefaultSeo } from "next-seo"
import { ThemeProvider } from "next-themes"
import siteConfig from "site.config"
import "../styles/index.css"
import "../styles/machines/index.css"
import "../styles/prism.css"

export default function App({ Component, pageProps }: any) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DefaultSeo {...siteConfig.seo} />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
