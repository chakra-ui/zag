import { ThemeProvider } from "next-themes"
import { type Metadata } from "next"
import { Wix_Madefor_Text } from "next/font/google"
import siteConfig from "site.config"
import "../styles/index.css"
import "../styles/machines/index.css"
import "../styles/prism.css"

const wixMadeforText = Wix_Madefor_Text({
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: "%s - Zag",
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: [
      {
        url: `${siteConfig.url}/open-graph/website.png`,
        width: 1240,
        height: 480,
      },
      {
        url: `${siteConfig.url}/open-graph/twitter.png`,
        width: 1012,
        height: 506,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    site: "@zag_js",
    creator: "@zag_js",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    other: [
      {
        rel: "mask-icon",
        url: "/favicon/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  other: {
    "msapplication-TileColor": "#00D163",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={wixMadeforText.variable}
    >
      <head>
        {process.env.NODE_ENV === "production" && (
          <script
            async
            defer
            data-domain="zagjs.com"
            src="https://plausible.io/js/plausible.js"
          />
        )}
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
