const merged = {
  "nested-menu": "menu#nested-menus",
  "range-slider": "slider#range-slider",
  "linear-progress": "progress#linear",
  "circular-progress": "progress#circular",
}

export const mergedPageRedirects = Object.entries(merged).flatMap(
  ([slug, target]) => [
    {
      source: `/components/${slug}`,
      destination: `/components/${target}`,
      permanent: true,
    },
    {
      source: `/components/:framework/${slug}`,
      destination: `/components/:framework/${target}`,
      permanent: true,
    },
  ],
)
