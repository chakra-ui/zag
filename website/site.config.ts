const baseConfig = {
  repo: "https://github.com/chakra-ui/zag-docs",
  title: "Zag - Rapidly build UI components without sweating over the logic.",
  description:
    "State machines for accessible, interactive and performant UI components",
  url: "https://zagjs.com",
}

const siteConfig = {
  ...baseConfig,
  projectName: "zag-js",
  copyright: `Copyright &copy; ${new Date().getFullYear()}`,
  openCollective: {
    url: "https://opencollective.com/chakra-ui",
  },
  author: {
    name: "Segun Adebayo",
    github: "https://github.com/segunadebayo",
    twitter: "https://twitter.com/thesegunadebayo",
    linkedin: "https://linkedin.com/in/thesegunadebayo",
    polywork: "https://www.polywork.com/segunadebayo",
    email: "sage@adebayosegun.com",
  },
  repo: {
    url: "https://github.com/chakra-ui/zag",
    editUrl: `${baseConfig.repo}/edit/main/data`,
    blobUrl: `${baseConfig.repo}/blob/main`,
  },
  discord: {
    url: "https://zagjs.com/discord",
  },
  seo: {
    title: baseConfig.title,
    titleTemplate: "%s - Zag",
    description: baseConfig.description,
    siteUrl: baseConfig.url,
    twitter: {
      handle: "@zag_js",
      site: baseConfig.url,
      cardType: "summary_large_image",
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: baseConfig.url,
      title: baseConfig.title,
      description: baseConfig.description,
      site_name: baseConfig.title,
      images: [
        {
          url: `${baseConfig.url}/open-graph/website.png`,
          width: 1240,
          height: 480,
        },
        {
          url: `${baseConfig.url}/open-graph/twitter.png`,
          width: 1012,
          height: 506,
        },
      ],
    },
  },
}

export default siteConfig
