import { countryList } from "./country-list"

export { paginationData } from "./pagination-data"

export const selectData = countryList.map((country) => ({
  label: `${country.name} (${country.code})`,
  value: country.code,
}))

export const accordionData = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]

export const avatarData = {
  full: [
    "https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png/revision/latest/top-crop/width/200/height/150?cb=20210223094656",
    "https://static.wikia.nocookie.net/naruto/images/2/27/Kakashi_Hatake.png/revision/latest/top-crop/width/200/height/150?cb=20170628120149",
    "https://static.wikia.nocookie.net/naruto/images/4/4a/Obito_Uchiha.png/revision/latest/top-crop/width/200/height/150?cb=20220223045744",
    "https://static.wikia.nocookie.net/naruto/images/e/e9/Itachi_Child_OL.png/revision/latest/top-crop/width/200/height/150?cb=20210415223303",
  ],
  broken:
    "https://broken.wikia.nocookie.net/naruto/images/e/e9/Itachi_ld_OL.png/revision/latest/top-crop/width/200/height/150?cb=20223303",
}

export const comboboxData = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "Andorra", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Anguilla", code: "AI" },
  { label: "Antarctica", code: "AQ" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Azerbaijan", code: "AZ" },
  { label: "Bahamas", code: "BS" },
  { label: "Bahrain", code: "BH" },
  { label: "Madagascar", code: "MG" },
  { label: "Malawi", code: "MW" },
  { label: "Malaysia", code: "MY" },
  { label: "Maldives", code: "MV" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Togo", code: "TG" },
  { label: "Tokelau", code: "TK" },
  { label: "Tonga", code: "TO" },
  { label: "Trinidad and Tobago", code: "TT" },
  { label: "Tunisia", code: "TN" },
]

export const tabsData = [
  {
    id: "nils",
    label: "Nils Frahm",
    content: `
    Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining
            classical and electronic music and for an unconventional approach to the piano in which he mixes a grand
            piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
    `,
  },
  {
    id: "agnes",
    label: "Agnes Obel",
    content: `
    Agnes Caroline Thaarup Obel is a Danish singer/songwriter. Her first album, Philharmonics, was released by
            PIAS Recordings on 4 October 2010 in Europe. Philharmonics was certified gold in June 2011 by the Belgian
            Entertainment Association (BEA) for sales of 10,000 Copies.
    `,
  },
  {
    id: "joke",
    label: "Joke",
    content: `
    Fear of complicated buildings: A complex complex complex.
    `,
  },
]

export const menuData = [
  [
    { label: "New File", value: "new-file" },
    { label: "New Tab", value: "new-tab" },
    { label: "New Window", value: "new-win" },
    { label: "More Tools →", value: "more-tools", trigger: true },
    { label: "Export", value: "export" },
    { label: "Go to Google...", value: "google" },
  ],
  [
    { label: "Save Page As...", value: "save-page" },
    { label: "Create Shortcuts", value: "shortcut" },
    { label: "Name Window...", value: "name-win" },
    { label: "Open nested →", value: "open-nested", trigger: true },
    { label: "Switch Window", value: "switch-win" },
    { label: "New Terminal", value: "new-term" },
  ],
  [
    { label: "Welcome", value: "welcome" },
    { label: "Playground", value: "playground" },
    { label: "Export", value: "export" },
  ],
]

export const menuOptionData = {
  order: [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
    { label: "None", value: "none" },
  ],
  type: [
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Address", value: "address" },
  ],
}

export const radioData = [
  { id: "apple", label: "Apples" },
  { id: "orange", label: "Oranges" },
  { id: "mango", label: "Mangoes" },
  { id: "grape", label: "Grapes" },
]

export const carouselData = [
  "https://tinyurl.com/5b6ka8jd",
  "https://tinyurl.com/7rmccdn5",
  "https://tinyurl.com/59jxz9uu",
  "https://tinyurl.com/6jurv23t",
  "https://tinyurl.com/yp4rfum7",
]

export const toggleGroupData = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
]

export const treeViewData = {
  name: "",
  children: [
    {
      name: "src",
      children: [{ name: "index.js" }, { name: "styles.css" }],
    },
    {
      name: "node_modules",
      children: [
        {
          name: "zag-js",
          children: [{ name: "treeview.mjs" }],
        },
        { name: "react", children: [{ name: "bundle.js" }] },
      ],
    },
    {
      name: ".npmignore",
    },
    {
      name: "package.json",
    },
    {
      name: "panda.config.ts",
    },
  ],
}

export const tourData = [
  {
    id: "step-0",
    title: "Centered tour (no target)",
    description: "This is the center of the world. Ready to start the tour?",
  },
  {
    id: "step-1",
    title: "Step 1. Welcome",
    description: "To the new world",
    target: () => document.querySelector<HTMLElement>("#step-1"),
    // effect({ next, update }: any) {
    //   const abort = new AbortController()

    //   fetch("https://api.github.com/users/octocat", { signal: abort.signal })
    //     .then((res) => res.json())
    //     .then((data) => {
    //       update({ title: data.name })
    //       next()
    //     })

    //   return () => {
    //     abort.abort()
    //   }
    // },
  },
  {
    id: "step-2",
    title: "Step 2. Inside a scrollable container",
    description: "Using scrollIntoView(...) rocks!",
    target: () => document.querySelector<HTMLElement>("#step-2"),
  },
  {
    id: "step-2a",
    title: "Step 2a. Inside an Iframe container",
    description: "It calculates the offset rect correctly. Thanks to floating UI!",
    target: () => {
      const [frameEl] = Array.from(frames)
      return frameEl?.document.querySelector<HTMLElement>("#step-2a")
    },
  },
  {
    id: "step-3",
    title: "Step 3. Normal scrolling",
    description: "The new world is a great place",
    target: () => document.querySelector<HTMLElement>("#step-3"),
  },
  {
    id: "step-4",
    title: "Step 4. Close to bottom",
    description: "So nice to see the scrolling works!",
    target: () => document.querySelector<HTMLElement>("#step-4"),
  },
  {
    id: "step-5",
    title: "You're all sorted! (no target)",
    description: "Thanks for trying out the tour. Enjoy the app!",
  },
]

export * as commandData from "./command"
