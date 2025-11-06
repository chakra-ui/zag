import { generateDefaultSeo } from "next-seo/pages"
import { ThemeProvider } from "next-themes"
import Head from "next/head"
import siteConfig from "site.config"
import "../styles/index.css"
import "../styles/machines/index.css"
import "../styles/prism.css"

export default function App({ Component, pageProps }: any) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Head>{generateDefaultSeo(siteConfig.seo)}</Head>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
